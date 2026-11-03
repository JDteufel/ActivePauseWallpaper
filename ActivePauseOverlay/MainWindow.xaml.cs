using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Media;
using System.Windows.Threading;
using Forms = System.Windows.Forms;

namespace ActivePauseOverlay;

public partial class MainWindow : Window
{
    private static readonly List<MainWindow> Windows = new();
    private static readonly DispatcherTimer LivelyMonitor = new() { Interval = TimeSpan.FromSeconds(1) };
    private static readonly CancellationTokenSource IpcCancellation = new();
    private static TcpListener? _listener;
    private static DateTime _lastSignalUtc = DateTime.MinValue;
    private static string _phase = "active";
    private static string _language = "en-US";
    private static double _remainingMs;
    private static string _command = string.Empty;
    private static long _commandSequence;
    private static bool _started;
    private static bool _stopped;
    private static readonly Dictionary<string, string[]> OverlayText = new(StringComparer.Ordinal)
    {
        ["en-US"] = ["Break soon", "The break starts in", "Active break", "Breathe, move, and rest", "Skip", "Finish"],
        ["es-CO"] = ["Pausa en breve", "La pausa comienza en", "Pausa activa", "Respira, muévete y descansa", "Saltar", "Terminar"],
        ["zh-CN"] = ["即将休息", "休息将在以下时间后开始", "活动休息", "深呼吸、活动身体并休息", "跳过", "结束"],
        ["fr-FR"] = ["Pause imminente", "La pause commence dans", "Pause active", "Respirez, bougez et reposez-vous", "Passer", "Terminer"],
        ["ar"] = ["اقترب موعد الاستراحة", "تبدأ الاستراحة خلال", "استراحة نشطة", "تنفس وتحرك واسترح", "تخطي", "إنهاء"],
        ["pt-BR"] = ["Pausa em breve", "A pausa começa em", "Pausa ativa", "Respire, movimente-se e descanse", "Pular", "Encerrar"],
        ["ru-RU"] = ["Скоро перерыв", "До перерыва осталось", "Активный перерыв", "Подышите, подвигайтесь и отдохните", "Пропустить", "Завершить"],
        ["de-DE"] = ["Pause steht bevor", "Die Pause beginnt in", "Aktive Pause", "Atmen Sie durch, bewegen Sie sich und ruhen Sie sich aus", "Überspringen", "Beenden"],
        ["ja-JP"] = ["まもなく休憩", "休憩開始まで", "アクティブ休憩", "深呼吸して、体を動かし、休みましょう", "スキップ", "終了"],
        ["tr-TR"] = ["Mola yaklaşıyor", "Mola şu süre içinde başlayacak", "Aktif mola", "Nefes alın, hareket edin ve dinlenin", "Atla", "Bitir"],
        ["ko-KR"] = ["곧 휴식 시간입니다", "휴식 시작까지", "활동 휴식", "숨을 고르고 몸을 움직이며 휴식하세요", "건너뛰기", "종료"],
        ["it-IT"] = ["Pausa imminente", "La pausa inizia tra", "Pausa attiva", "Respira, muoviti e riposati", "Salta", "Termina"]
    };

    private readonly Forms.Screen _screen;
    private string _renderedPhase = string.Empty;

    public MainWindow()
    {
        InitializeComponent();
        _screen = Forms.Screen.AllScreens[Windows.Count % Forms.Screen.AllScreens.Length];
        Loaded += OnLoaded;
        Closed += OnClosed;
        SkipButton.Click += (_, _) => RecordCommand("skip");
        FinishButton.Click += (_, _) => RecordCommand("finish");
    }

    private void OnLoaded(object sender, RoutedEventArgs e)
    {
        SetBounds();
        Visibility = Visibility.Hidden;
        Windows.Add(this);
        if (_started || _stopped) return;

        _started = true;
        StartIpcServer();
        LivelyMonitor.Tick += OnLivelyMonitorTick;
        LivelyMonitor.Start();

        foreach (var unused in Forms.Screen.AllScreens.Skip(1)) new MainWindow().Show();
    }

    private static void OnLivelyMonitorTick(object? sender, EventArgs e)
    {
        if (DateTime.UtcNow - _lastSignalUtc > TimeSpan.FromSeconds(5))
        {
            _phase = "active";
            _remainingMs = 0;
            foreach (var window in Windows) window.Render();
        }
    }

    private static void StartIpcServer()
    {
        _listener = new TcpListener(IPAddress.Loopback, 18472);
        _listener.Start();
        _ = Task.Run(() => ListenForClientsAsync(IpcCancellation.Token));
    }

    private static async Task ListenForClientsAsync(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested && _listener is not null)
        {
            TcpClient client;
            try
            {
                client = await _listener.AcceptTcpClientAsync(cancellationToken);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                break;
            }

            using (client)
            using (var stream = client.GetStream())
            {
                var buffer = new byte[4096];
                var bytesRead = await stream.ReadAsync(buffer, cancellationToken);
                var request = Encoding.UTF8.GetString(buffer, 0, bytesRead);
                var requestParts = request.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                var method = requestParts.ElementAtOrDefault(0) ?? string.Empty;
                var path = requestParts.ElementAtOrDefault(1) ?? string.Empty;
                var route = path.Split('?', 2).ElementAtOrDefault(0) ?? string.Empty;
                var responseBody = string.Empty;
                var status = "404 Not Found";
                var shouldShutdown = false;

                if (method == "GET" && route == "/state")
                {
                    responseBody = System.Windows.Application.Current.Dispatcher.Invoke(GetStateJson);
                    status = "200 OK";
                }
                else if (method == "POST" && route == "/signal")
                {
                    var isValidSignal = System.Windows.Application.Current.Dispatcher.Invoke(() => ApplySignal(path));
                    status = isValidSignal ? "200 OK" : "400 Bad Request";
                }
                else if (method == "POST" && route == "/command")
                {
                    var isValidCommand = System.Windows.Application.Current.Dispatcher.Invoke(() => ApplyCommand(path));
                    status = isValidCommand ? "200 OK" : "400 Bad Request";
                }
                else if (method == "POST" && route == "/shutdown")
                {
                    status = "200 OK";
                    shouldShutdown = true;
                }
                else if (method == "OPTIONS" && (route == "/state" || route == "/signal" || route == "/command" || route == "/shutdown"))
                {
                    status = "204 No Content";
                }
                else if (route == "/state" || route == "/signal" || route == "/command" || route == "/shutdown")
                {
                    status = "405 Method Not Allowed";
                }

                var response = $"HTTP/1.1 {status}\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\nAccess-Control-Allow-Headers: Content-Type\r\nContent-Type: application/json\r\nContent-Length: {Encoding.UTF8.GetByteCount(responseBody)}\r\nConnection: close\r\n\r\n{responseBody}";
                await stream.WriteAsync(Encoding.UTF8.GetBytes(response), cancellationToken);
                if (shouldShutdown)
                {
                    _ = System.Windows.Application.Current.Dispatcher.BeginInvoke(
                        new Action(() => System.Windows.Application.Current.Shutdown()),
                        DispatcherPriority.Background);
                }
            }
        }
    }

    private static bool ApplySignal(string path)
    {
        var query = path.Split('?', 2).ElementAtOrDefault(1) ?? string.Empty;
        var values = query.Split('&', StringSplitOptions.RemoveEmptyEntries)
            .Select(pair => pair.Split('=', 2))
            .Where(pair => pair.Length == 2)
            .ToDictionary(pair => pair[0], pair => Uri.UnescapeDataString(pair[1]));

        if (!values.TryGetValue("phase", out var phase) || phase is not ("active" or "warning" or "pause")) return false;
        if (values.TryGetValue("language", out var language))
        {
            if (!OverlayText.ContainsKey(language)) return false;
            _language = language;
        }
        _phase = phase;
        _remainingMs = values.TryGetValue("remainingMs", out var remaining)
            && double.TryParse(remaining, NumberStyles.Float, CultureInfo.InvariantCulture, out var milliseconds)
            && double.IsFinite(milliseconds)
                ? Math.Max(0, milliseconds)
                : 0;
        _lastSignalUtc = DateTime.UtcNow;
        foreach (var window in Windows) window.Render();
        return true;
    }

    private static bool ApplyCommand(string path)
    {
        var query = path.Split('?', 2).ElementAtOrDefault(1) ?? string.Empty;
        var command = query.Split('&', StringSplitOptions.RemoveEmptyEntries)
            .Select(pair => pair.Split('=', 2))
            .FirstOrDefault(pair => pair.Length == 2 && pair[0] == "name")
            ?.ElementAtOrDefault(1);

        if ((_phase == "warning" && command == "skip")
            || (_phase == "pause" && command == "finish"))
        {
            _command = command;
            _commandSequence++;
            return true;
        }

        return false;
    }

    private static void RecordCommand(string command)
    {
        _command = command;
        _commandSequence++;
    }

    private static string GetStateJson() => JsonSerializer.Serialize(new
    {
        phase = _phase,
        remainingMs = _remainingMs,
        command = _command,
        commandSequence = _commandSequence
    });

    private void SetBounds()
    {
        Left = _screen.Bounds.Left;
        Top = _screen.Bounds.Top;
        Width = _screen.Bounds.Width;
        Height = _screen.Bounds.Height;
    }

    private void Render()
    {
        CountdownText.Text = TimeSpan.FromMilliseconds(_remainingMs)
            .ToString(@"hh\:mm\:ss", CultureInfo.GetCultureInfo(_language));
        var isWarning = _phase == "warning";
        FlowDirection = _language == "ar"
            ? System.Windows.FlowDirection.RightToLeft
            : System.Windows.FlowDirection.LeftToRight;
        var text = OverlayText[_language];
        TitleText.Text = text[isWarning ? 0 : 2];
        MessageText.Text = text[isWarning ? 1 : 3];
        SkipButton.Content = text[4];
        FinishButton.Content = text[5];
        SkipButton.Visibility = isWarning ? Visibility.Visible : Visibility.Collapsed;
        FinishButton.Visibility = _phase == "pause" ? Visibility.Visible : Visibility.Collapsed;

        if (_renderedPhase != _phase)
        {
            _renderedPhase = _phase;
            if (isWarning)
            {
                OverlayRoot.Background = System.Windows.Media.Brushes.Transparent;
                SizeToContent = SizeToContent.WidthAndHeight;
                UpdateLayout();
                Left = _screen.Bounds.Left + (_screen.Bounds.Width - ActualWidth) / 2;
                Top = _screen.Bounds.Top + (_screen.Bounds.Height - ActualHeight) / 2;
            }
            else
            {
                SizeToContent = SizeToContent.Manual;
                SetBounds();
                OverlayRoot.Background = _phase == "pause"
                    ? new SolidColorBrush(System.Windows.Media.Color.FromArgb(0xF5, 0x10, 0x13, 0x18))
                    : System.Windows.Media.Brushes.Transparent;
            }
        }

        Visibility = _phase == "active" ? Visibility.Hidden : Visibility.Visible;
    }

    private void OnClosed(object? sender, EventArgs e)
    {
        Windows.Remove(this);
        if (Windows.Count == 0)
        {
            _stopped = true;
            LivelyMonitor.Stop();
            IpcCancellation.Cancel();
            _listener?.Stop();
            System.Windows.Application.Current.Shutdown();
        }
    }
}
