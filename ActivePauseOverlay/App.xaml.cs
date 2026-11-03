using System.Threading;
using System.Windows;
using Application = System.Windows.Application;

namespace ActivePauseOverlay;

public partial class App : Application
{
	private Mutex? _singleInstanceMutex;

	protected override void OnStartup(StartupEventArgs e)
	{
		_singleInstanceMutex = new Mutex(true, "Local\\ActivePauseOverlay", out var isNewInstance);
		if (!isNewInstance)
		{
			Shutdown();
			return;
		}

		base.OnStartup(e);
	}

	protected override void OnExit(ExitEventArgs e)
	{
		_singleInstanceMutex?.Dispose();
		base.OnExit(e);
	}
}
