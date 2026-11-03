(function () {
  const view = window.ActivePauseView;
  const overlayClient = window.ActivePauseOverlayClient;
  if (!view || !overlayClient) throw new Error('Pause reminder view and overlay client must load before pause-reminder.js.');
  const presets = [
    { activeMinutes: 20, pauseMinutes: 2 },
    { activeMinutes: 30, pauseMinutes: 5 },
    { activeMinutes: 45, pauseMinutes: 5 },
    { activeMinutes: 50, pauseMinutes: 10 },
    { activeMinutes: 90, pauseMinutes: 15 },
    { activeSeconds: 30, pauseSeconds: 5 }
  ];
  const languages = [
    { locale: 'en-US', direction: 'ltr', text: {
      activate: 'Activate', deactivate: 'Deactivate', restart: 'Restart', pause: 'Pause', resume: 'Resume', takePause: 'Take a Break',
      disabled: 'Pause reminder: disabled', starting: 'Starting timer...', stopped: 'Timer stopped',
      paused: 'Timer paused: {time}', warning: 'Break begins in: {time}', break: 'Break remaining: {time}', active: 'Next break in: {time}',
      overlayStarting: 'Starting overlay...', overlayUnavailable: 'Overlay unavailable', overlayDisconnected: 'Overlay is off',
      overlayLost: 'Overlay connection lost', overlaySynchronized: 'Synchronized with overlay',
      startError: 'Could not start overlay', shutdownError: 'Could not close overlay',
      warningTitle: 'Break soon', warningMessage: 'The break starts in', breakTitle: 'Active break', breakMessage: 'Breathe, move, and rest',
      skip: 'Skip', finish: 'Finish',
      century: 'century {value}', millennium: 'millennium {value}', era: 'Contemporary Era',
      geology: 'Cenozoic · Quaternary · Holocene · Meghalayan',
      wallpaperLabel: 'Clock and system status', clockLabel: 'Clock', contextLabel: 'Historical and geological context', systemLabel: 'System status',
      cpuLabel: 'CPU usage history', gpuLabel: 'GPU usage history', ramLabel: 'RAM usage history', albumArtLabel: 'Album art',
      visualizerLabel: 'Audio visualizer'
    }},
    { locale: 'es-CO', direction: 'ltr', text: {
      activate: 'Activar', deactivate: 'Desactivar', restart: 'Reiniciar', pause: 'Pausar', resume: 'Continuar', takePause: 'Tomar pausa',
      disabled: 'Recordatorio de pausa: desactivado', starting: 'Iniciando temporizador...', stopped: 'Temporizador detenido',
      paused: 'Temporizador pausado: {time}', warning: 'La pausa comienza en: {time}', break: 'Descanso restante: {time}', active: 'Próxima pausa en: {time}',
      overlayStarting: 'Iniciando superposición...', overlayUnavailable: 'Superposición no disponible', overlayDisconnected: 'Superposición desactivada',
      overlayLost: 'Se perdió la conexión con la superposición', overlaySynchronized: 'Sincronizada con la superposición',
      startError: 'No se pudo iniciar la superposición', shutdownError: 'No se pudo cerrar la superposición',
      warningTitle: 'Pausa en breve', warningMessage: 'La pausa comienza en', breakTitle: 'Pausa activa', breakMessage: 'Respira, muévete y descansa',
      skip: 'Saltar', finish: 'Terminar',
      century: 'siglo {value}', millennium: 'milenio {value}', era: 'Edad Contemporánea',
      geology: 'Cenozoico · Cuaternario · Holoceno · Meghalayano',
      wallpaperLabel: 'Reloj y estado del sistema', clockLabel: 'Reloj', contextLabel: 'Contexto histórico y geológico', systemLabel: 'Estado del sistema',
      cpuLabel: 'Historial de uso de CPU', gpuLabel: 'Historial de uso de GPU', ramLabel: 'Historial de uso de RAM', albumArtLabel: 'Carátula del álbum',
      visualizerLabel: 'Visualizador de audio'
    }},
    { locale: 'zh-CN', direction: 'ltr', text: {
      activate: '启动', deactivate: '关闭', restart: '重新开始', pause: '暂停', resume: '继续', takePause: '立即休息',
      disabled: '休息提醒：已关闭', starting: '正在启动计时器…', stopped: '计时器已停止',
      paused: '计时器已暂停：{time}', warning: '休息将在 {time} 后开始', break: '休息剩余：{time}', active: '距离下次休息：{time}',
      overlayStarting: '正在启动覆盖层…', overlayUnavailable: '覆盖层不可用', overlayDisconnected: '覆盖层已关闭',
      overlayLost: '与覆盖层的连接已断开', overlaySynchronized: '已与覆盖层同步',
      startError: '无法启动覆盖层', shutdownError: '无法关闭覆盖层',
      warningTitle: '即将休息', warningMessage: '休息将在以下时间后开始', breakTitle: '活动休息', breakMessage: '深呼吸、活动身体并休息',
      skip: '跳过', finish: '结束',
      century: '第{value}世纪', millennium: '第{value}千年', era: '当代',
      geology: '新生代 · 第四纪 · 全新世 · 梅加拉亚期',
      wallpaperLabel: '时钟和系统状态', clockLabel: '时钟', contextLabel: '历史与地质背景', systemLabel: '系统状态',
      cpuLabel: 'CPU 使用历史', gpuLabel: 'GPU 使用历史', ramLabel: '内存使用历史', albumArtLabel: '专辑封面',
      visualizerLabel: '音频可视化'
    }},
    { locale: 'fr-FR', direction: 'ltr', text: {
      activate: 'Activer', deactivate: 'Désactiver', restart: 'Redémarrer', pause: 'Pause', resume: 'Reprendre', takePause: 'Faire une pause',
      disabled: 'Rappel de pause : désactivé', starting: 'Démarrage du minuteur…', stopped: 'Minuteur arrêté',
      paused: 'Minuteur en pause : {time}', warning: 'La pause commence dans : {time}', break: 'Pause restante : {time}', active: 'Prochaine pause dans : {time}',
      overlayStarting: 'Démarrage de la superposition…', overlayUnavailable: 'Superposition indisponible', overlayDisconnected: 'Superposition désactivée',
      overlayLost: 'Connexion à la superposition perdue', overlaySynchronized: 'Synchronisé avec la superposition',
      startError: 'Impossible de démarrer la superposition', shutdownError: 'Impossible de fermer la superposition',
      warningTitle: 'Pause imminente', warningMessage: 'La pause commence dans', breakTitle: 'Pause active', breakMessage: 'Respirez, bougez et reposez-vous',
      skip: 'Passer', finish: 'Terminer',
      century: 'siècle {value}', millennium: 'millénaire {value}', era: 'Époque contemporaine',
      geology: 'Cénozoïque · Quaternaire · Holocène · Meghalayen',
      wallpaperLabel: 'Horloge et état du système', clockLabel: 'Horloge', contextLabel: 'Contexte historique et géologique', systemLabel: 'État du système',
      cpuLabel: 'Historique d’utilisation du CPU', gpuLabel: 'Historique d’utilisation du GPU', ramLabel: 'Historique d’utilisation de la RAM', albumArtLabel: 'Pochette de l’album',
      visualizerLabel: 'Visualiseur audio'
    }},
    { locale: 'ar', direction: 'rtl', text: {
      activate: 'تفعيل', deactivate: 'إيقاف', restart: 'إعادة التشغيل', pause: 'إيقاف مؤقت', resume: 'متابعة', takePause: 'خذ استراحة',
      disabled: 'تذكير الاستراحة: متوقف', starting: 'جارٍ تشغيل المؤقت…', stopped: 'المؤقت متوقف',
      paused: 'المؤقت متوقف مؤقتًا: {time}', warning: 'تبدأ الاستراحة خلال: {time}', break: 'الوقت المتبقي للاستراحة: {time}', active: 'الاستراحة التالية خلال: {time}',
      overlayStarting: 'جارٍ تشغيل النافذة…', overlayUnavailable: 'النافذة غير متاحة', overlayDisconnected: 'النافذة متوقفة',
      overlayLost: 'انقطع الاتصال بالنافذة', overlaySynchronized: 'متزامن مع النافذة',
      startError: 'تعذر تشغيل النافذة', shutdownError: 'تعذر إغلاق النافذة',
      warningTitle: 'اقترب موعد الاستراحة', warningMessage: 'تبدأ الاستراحة خلال', breakTitle: 'استراحة نشطة', breakMessage: 'تنفس وتحرك واسترح',
      skip: 'تخطي', finish: 'إنهاء',
      century: 'القرن {value}', millennium: 'الألفية {value}', era: 'العصر المعاصر',
      geology: 'حقبة الحياة الحديثة · الرباعي · الهولوسين · الميغالايي',
      wallpaperLabel: 'الساعة وحالة النظام', clockLabel: 'الساعة', contextLabel: 'السياق التاريخي والجيولوجي', systemLabel: 'حالة النظام',
      cpuLabel: 'سجل استخدام المعالج', gpuLabel: 'سجل استخدام معالج الرسوميات', ramLabel: 'سجل استخدام الذاكرة', albumArtLabel: 'غلاف الألبوم',
      visualizerLabel: 'عارض الصوت'
    }},
    { locale: 'pt-BR', direction: 'ltr', text: {
      activate: 'Ativar', deactivate: 'Desativar', restart: 'Reiniciar', pause: 'Pausar', resume: 'Continuar', takePause: 'Fazer uma pausa',
      disabled: 'Lembrete de pausa: desativado', starting: 'Iniciando temporizador…', stopped: 'Temporizador parado',
      paused: 'Temporizador pausado: {time}', warning: 'A pausa começa em: {time}', break: 'Tempo restante da pausa: {time}', active: 'Próxima pausa em: {time}',
      overlayStarting: 'Iniciando sobreposição…', overlayUnavailable: 'Sobreposição indisponível', overlayDisconnected: 'Sobreposição desativada',
      overlayLost: 'Conexão com a sobreposição perdida', overlaySynchronized: 'Sincronizado com a sobreposição',
      startError: 'Não foi possível iniciar a sobreposição', shutdownError: 'Não foi possível fechar a sobreposição',
      warningTitle: 'Pausa em breve', warningMessage: 'A pausa começa em', breakTitle: 'Pausa ativa', breakMessage: 'Respire, movimente-se e descanse',
      skip: 'Pular', finish: 'Encerrar',
      century: 'século {value}', millennium: 'milênio {value}', era: 'Idade Contemporânea',
      geology: 'Cenozoico · Quaternário · Holoceno · Meghalaiano',
      wallpaperLabel: 'Relógio e status do sistema', clockLabel: 'Relógio', contextLabel: 'Contexto histórico e geológico', systemLabel: 'Status do sistema',
      cpuLabel: 'Histórico de uso da CPU', gpuLabel: 'Histórico de uso da GPU', ramLabel: 'Histórico de uso da RAM', albumArtLabel: 'Capa do álbum',
      visualizerLabel: 'Visualizador de áudio'
    }},
    { locale: 'ru-RU', direction: 'ltr', text: {
      activate: 'Включить', deactivate: 'Выключить', restart: 'Перезапустить', pause: 'Пауза', resume: 'Продолжить', takePause: 'Сделать перерыв',
      disabled: 'Напоминание о перерыве: выключено', starting: 'Запуск таймера…', stopped: 'Таймер остановлен',
      paused: 'Таймер на паузе: {time}', warning: 'До перерыва: {time}', break: 'Осталось отдыхать: {time}', active: 'До следующего перерыва: {time}',
      overlayStarting: 'Запуск окна…', overlayUnavailable: 'Окно недоступно', overlayDisconnected: 'Окно выключено',
      overlayLost: 'Соединение с окном потеряно', overlaySynchronized: 'Синхронизировано с окном',
      startError: 'Не удалось запустить окно', shutdownError: 'Не удалось закрыть окно',
      warningTitle: 'Скоро перерыв', warningMessage: 'До перерыва осталось', breakTitle: 'Активный перерыв', breakMessage: 'Подышите, подвигайтесь и отдохните',
      skip: 'Пропустить', finish: 'Завершить',
      century: '{value} век', millennium: '{value} тысячелетие', era: 'Современная эпоха',
      geology: 'Кайнозой · Четвертичный период · Голоцен · Мегхалай',
      wallpaperLabel: 'Часы и состояние системы', clockLabel: 'Часы', contextLabel: 'Исторический и геологический контекст', systemLabel: 'Состояние системы',
      cpuLabel: 'История загрузки ЦП', gpuLabel: 'История загрузки ГП', ramLabel: 'История использования ОЗУ', albumArtLabel: 'Обложка альбома',
      visualizerLabel: 'Визуализатор аудио'
    }},
    { locale: 'de-DE', direction: 'ltr', text: {
      activate: 'Aktivieren', deactivate: 'Deaktivieren', restart: 'Neu starten', pause: 'Pausieren', resume: 'Fortsetzen', takePause: 'Pause machen',
      disabled: 'Pausenerinnerung: deaktiviert', starting: 'Timer wird gestartet…', stopped: 'Timer angehalten',
      paused: 'Timer pausiert: {time}', warning: 'Pause beginnt in: {time}', break: 'Verbleibende Pause: {time}', active: 'Nächste Pause in: {time}',
      overlayStarting: 'Overlay wird gestartet…', overlayUnavailable: 'Overlay nicht verfügbar', overlayDisconnected: 'Overlay ist ausgeschaltet',
      overlayLost: 'Verbindung zum Overlay verloren', overlaySynchronized: 'Mit Overlay synchronisiert',
      startError: 'Overlay konnte nicht gestartet werden', shutdownError: 'Overlay konnte nicht geschlossen werden',
      warningTitle: 'Pause steht bevor', warningMessage: 'Die Pause beginnt in', breakTitle: 'Aktive Pause', breakMessage: 'Atmen Sie durch, bewegen Sie sich und ruhen Sie sich aus',
      skip: 'Überspringen', finish: 'Beenden',
      century: '{value}. Jahrhundert', millennium: '{value}. Jahrtausend', era: 'Gegenwart',
      geology: 'Känozoikum · Quartär · Holozän · Meghalayum',
      wallpaperLabel: 'Uhr und Systemstatus', clockLabel: 'Uhr', contextLabel: 'Historischer und geologischer Kontext', systemLabel: 'Systemstatus',
      cpuLabel: 'CPU-Auslastungsverlauf', gpuLabel: 'GPU-Auslastungsverlauf', ramLabel: 'RAM-Auslastungsverlauf', albumArtLabel: 'Albumcover',
      visualizerLabel: 'Audio-Visualizer'
    }},
    { locale: 'ja-JP', direction: 'ltr', text: {
      activate: '開始', deactivate: '停止', restart: '再起動', pause: '一時停止', resume: '再開', takePause: '休憩する',
      disabled: '休憩リマインダー：オフ', starting: 'タイマーを開始しています…', stopped: 'タイマー停止中',
      paused: 'タイマー一時停止：{time}', warning: '休憩開始まで：{time}', break: '休憩の残り時間：{time}', active: '次の休憩まで：{time}',
      overlayStarting: 'オーバーレイを起動しています…', overlayUnavailable: 'オーバーレイを利用できません', overlayDisconnected: 'オーバーレイ停止中',
      overlayLost: 'オーバーレイとの接続が切れました', overlaySynchronized: 'オーバーレイと同期しています',
      startError: 'オーバーレイを起動できませんでした', shutdownError: 'オーバーレイを終了できませんでした',
      warningTitle: 'まもなく休憩', warningMessage: '休憩開始まで', breakTitle: 'アクティブ休憩', breakMessage: '深呼吸して、体を動かし、休みましょう',
      skip: 'スキップ', finish: '終了',
      century: '{value}世紀', millennium: '第{value}千年紀', era: '現代',
      geology: '新生代 · 第四紀 · 完新世 · メーガーラヤン',
      wallpaperLabel: '時計とシステム状態', clockLabel: '時計', contextLabel: '歴史・地質の背景', systemLabel: 'システム状態',
      cpuLabel: 'CPU 使用率の履歴', gpuLabel: 'GPU 使用率の履歴', ramLabel: 'メモリ使用率の履歴', albumArtLabel: 'アルバムアート',
      visualizerLabel: 'オーディオビジュアライザー'
    }},
    { locale: 'tr-TR', direction: 'ltr', text: {
      activate: 'Etkinleştir', deactivate: 'Devre dışı bırak', restart: 'Yeniden başlat', pause: 'Duraklat', resume: 'Sürdür', takePause: 'Mola ver',
      disabled: 'Mola hatırlatıcısı: kapalı', starting: 'Zamanlayıcı başlatılıyor…', stopped: 'Zamanlayıcı durduruldu',
      paused: 'Zamanlayıcı duraklatıldı: {time}', warning: 'Molaya kalan süre: {time}', break: 'Kalan mola süresi: {time}', active: 'Sonraki molaya kalan süre: {time}',
      overlayStarting: 'Katman başlatılıyor…', overlayUnavailable: 'Katman kullanılamıyor', overlayDisconnected: 'Katman kapalı',
      overlayLost: 'Katman bağlantısı kesildi', overlaySynchronized: 'Katmanla eşitlendi',
      startError: 'Katman başlatılamadı', shutdownError: 'Katman kapatılamadı',
      warningTitle: 'Mola yaklaşıyor', warningMessage: 'Mola şu süre içinde başlayacak', breakTitle: 'Aktif mola', breakMessage: 'Nefes alın, hareket edin ve dinlenin',
      skip: 'Atla', finish: 'Bitir',
      century: '{value}. yüzyıl', millennium: '{value}. binyıl', era: 'Çağdaş dönem',
      geology: 'Senozoyik · Kuvaterner · Holosen · Meghalaya',
      wallpaperLabel: 'Saat ve sistem durumu', clockLabel: 'Saat', contextLabel: 'Tarihî ve jeolojik bağlam', systemLabel: 'Sistem durumu',
      cpuLabel: 'CPU kullanım geçmişi', gpuLabel: 'GPU kullanım geçmişi', ramLabel: 'RAM kullanım geçmişi', albumArtLabel: 'Albüm kapağı',
      visualizerLabel: 'Ses görselleştiricisi'
    }},
    { locale: 'ko-KR', direction: 'ltr', text: {
      activate: '시작', deactivate: '끄기', restart: '다시 시작', pause: '일시 정지', resume: '계속', takePause: '휴식하기',
      disabled: '휴식 알림: 꺼짐', starting: '타이머 시작 중…', stopped: '타이머 중지됨',
      paused: '타이머 일시 정지: {time}', warning: '휴식 시작까지: {time}', break: '남은 휴식 시간: {time}', active: '다음 휴식까지: {time}',
      overlayStarting: '오버레이 시작 중…', overlayUnavailable: '오버레이를 사용할 수 없음', overlayDisconnected: '오버레이 꺼짐',
      overlayLost: '오버레이 연결이 끊어짐', overlaySynchronized: '오버레이와 동기화됨',
      startError: '오버레이를 시작할 수 없음', shutdownError: '오버레이를 닫을 수 없음',
      warningTitle: '곧 휴식 시간입니다', warningMessage: '휴식 시작까지', breakTitle: '활동 휴식', breakMessage: '숨을 고르고 몸을 움직이며 휴식하세요',
      skip: '건너뛰기', finish: '종료',
      century: '{value}세기', millennium: '{value}천년기', era: '현대',
      geology: '신생대 · 제4기 · 홀로세 · 메갈라야절',
      wallpaperLabel: '시계 및 시스템 상태', clockLabel: '시계', contextLabel: '역사 및 지질학적 배경', systemLabel: '시스템 상태',
      cpuLabel: 'CPU 사용 기록', gpuLabel: 'GPU 사용 기록', ramLabel: 'RAM 사용 기록', albumArtLabel: '앨범 아트',
      visualizerLabel: '오디오 시각화 도구'
    }},
    { locale: 'it-IT', direction: 'ltr', text: {
      activate: 'Attiva', deactivate: 'Disattiva', restart: 'Riavvia', pause: 'Pausa', resume: 'Riprendi', takePause: 'Fai una pausa',
      disabled: 'Promemoria pausa: disattivato', starting: 'Avvio del timer…', stopped: 'Timer fermo',
      paused: 'Timer in pausa: {time}', warning: 'La pausa inizia tra: {time}', break: 'Pausa rimanente: {time}', active: 'Prossima pausa tra: {time}',
      overlayStarting: 'Avvio della sovrapposizione…', overlayUnavailable: 'Sovrapposizione non disponibile', overlayDisconnected: 'Sovrapposizione disattivata',
      overlayLost: 'Connessione alla sovrapposizione persa', overlaySynchronized: 'Sincronizzata con la sovrapposizione',
      startError: 'Impossibile avviare la sovrapposizione', shutdownError: 'Impossibile chiudere la sovrapposizione',
      warningTitle: 'Pausa imminente', warningMessage: 'La pausa inizia tra', breakTitle: 'Pausa attiva', breakMessage: 'Respira, muoviti e riposati',
      skip: 'Salta', finish: 'Termina',
      century: 'secolo {value}', millennium: 'millennio {value}', era: 'Età contemporanea',
      geology: 'Cenozoico · Quaternario · Olocene · Meghalayano',
      wallpaperLabel: 'Orologio e stato del sistema', clockLabel: 'Orologio', contextLabel: 'Contesto storico e geologico', systemLabel: 'Stato del sistema',
      cpuLabel: 'Cronologia uso CPU', gpuLabel: 'Cronologia uso GPU', ramLabel: 'Cronologia uso RAM', albumArtLabel: 'Copertina dell’album',
      visualizerLabel: 'Visualizzatore audio'
    }}
  ];
  const state = {
    enabled: true,
    presetIndex: 1,
    languageIndex: 0,
    lifecycle: null,
    overlayConnected: false,
    pollId: null,
    lastCommandSequence: 0,
    startRequest: 0
  };
  function getPreset() {
    return presets[state.presetIndex] || presets[1];
  }

  function getLanguage() {
    return languages[state.languageIndex] || languages[0];
  }

  function translate(key, values = {}) {
    return getLanguage().text[key].replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
  }

  function setDocumentLanguage() {
    view.setDocumentLanguage(translate, state.overlayConnected, getLanguage());
  }

  function getDurationMs(kind) {
    const preset = getPreset();
    if (preset[kind] !== undefined) return preset[kind] * 1000;
    const minuteKind = kind.replace('Seconds', 'Minutes');
    return (preset[minuteKind] || 0) * 60000;
  }

  function formatDuration(milliseconds) {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const numberFormat = new Intl.NumberFormat(getLanguage().locale, {
      minimumIntegerDigits: 2,
      useGrouping: false
    });
    return [hours, minutes, seconds].map((value) => numberFormat.format(value)).join(':');
  }

  function reportError(message, error) {
    console.error(message, error);
    view.setConnectionMessage(message);
  }

  async function sendPhase(phase, remainingMs) {
    await overlayClient.sendPhase(phase, remainingMs, getLanguage().locale);
  }

  class TimerState {
    constructor(controller, name) {
      this.controller = controller;
      this.name = name;
    }

    enter() {
      this.controller.render();
    }

    remainingMs() {
      return 0;
    }

    pause() {}

    continue() {}

    restart() {
      this.controller.beginActive();
    }

    takePause() {
      this.controller.beginActive(1000);
    }

    handleCommand() {}
  }

  class InactiveState extends TimerState {
    constructor(controller) {
      super(controller, 'inactive');
    }

    activate() {
      this.controller.activateOverlay();
    }
  }

  class StartingState extends TimerState {
    constructor(controller) {
      super(controller, 'starting');
    }
  }

  class HelperUnavailableState extends TimerState {
    constructor(controller) {
      super(controller, 'unavailable');
    }

    activate() {
      this.controller.activateOverlay();
    }
  }

  class ActiveCountdownState extends TimerState {
    constructor(controller, durationMs) {
      super(controller, 'active');
      this.deadline = Date.now() + durationMs;
    }

    enter() {
      this.controller.schedule(() => this.controller.beginWarning(), Math.max(0, this.deadline - Date.now() - 10000));
      this.controller.publishPhase();
      this.controller.render();
    }

    remainingMs() {
      return Math.max(0, this.deadline - Date.now());
    }

    pause() {
      this.controller.transition(new PausedCountdownState(this.controller, this.remainingMs()));
    }
  }

  class PausedCountdownState extends TimerState {
    constructor(controller, remainingMs) {
      super(controller, 'paused');
      this.frozenRemainingMs = remainingMs;
    }

    enter() {
      this.controller.publishPhase();
      this.controller.render();
    }

    remainingMs() {
      return this.frozenRemainingMs;
    }

    continue() {
      this.controller.beginActive(this.frozenRemainingMs);
    }
  }

  class WarningState extends TimerState {
    constructor(controller) {
      super(controller, 'warning');
      this.deadline = Date.now() + 10000;
    }

    enter() {
      this.controller.schedule(() => this.controller.beginPause(), 10000);
      this.controller.publishPhase();
      this.controller.render();
    }

    remainingMs() {
      return Math.max(0, this.deadline - Date.now());
    }

    handleCommand(command) {
      if (command === 'skip') this.controller.beginActive();
    }
  }

  class ActivePauseState extends TimerState {
    constructor(controller) {
      super(controller, 'pause');
      this.deadline = Date.now() + controller.pauseDuration();
    }

    enter() {
      this.controller.schedule(() => this.controller.beginActive(), this.controller.pauseDuration());
      this.controller.publishPhase();
      this.controller.render();
    }

    remainingMs() {
      return Math.max(0, this.deadline - Date.now());
    }

    handleCommand(command) {
      if (command === 'finish') this.controller.beginActive();
    }
  }

  class PauseTimer {
    constructor() {
      this.lifecycle = new InactiveState(this);
      this.countdownTimeout = null;
      this.heartbeatId = null;
      this.phaseInFlight = false;
      this.pendingPhase = null;
      this.pollInFlight = false;
    }

    transition(nextState) {
      this.clearCountdown();
      this.lifecycle = nextState;
      nextState.enter();
    }

    clearCountdown() {
      if (this.countdownTimeout !== null) clearTimeout(this.countdownTimeout);
      this.countdownTimeout = null;
    }

    schedule(callback, delay) {
      this.clearCountdown();
      this.countdownTimeout = setTimeout(callback, Math.max(0, delay));
    }

    startHeartbeat() {
      if (this.heartbeatId !== null) clearInterval(this.heartbeatId);
      this.heartbeatId = setInterval(() => {
        this.publishPhase();
        this.render();
      }, 1000);
    }

    stopHeartbeat() {
      if (this.heartbeatId !== null) clearInterval(this.heartbeatId);
      if (this.pollId !== null) clearInterval(this.pollId);
      this.heartbeatId = null;
      this.pollId = null;
    }

    phase() {
      if (this.lifecycle.name === 'warning') return 'warning';
      if (this.lifecycle.name === 'pause') return 'pause';
      return 'active';
    }

    remainingMs() {
      return this.lifecycle.remainingMs();
    }

    publishPhase() {
      if (!state.overlayConnected) return;
      this.pendingPhase = { phase: this.phase(), remainingMs: this.remainingMs() };
      if (this.phaseInFlight) return;
      this.phaseInFlight = true;
      const publishPending = async () => {
        try {
          while (state.overlayConnected && this.pendingPhase) {
            const nextPhase = this.pendingPhase;
            this.pendingPhase = null;
            await sendPhase(nextPhase.phase, nextPhase.remainingMs);
          }
        } catch (error) {
          this.handleHelperUnavailable(error);
        } finally {
          this.phaseInFlight = false;
          if (state.overlayConnected && this.pendingPhase) this.publishPhase();
        }
      };
      publishPending();
    }

    async activateOverlay() {
      if (!state.enabled || this.lifecycle.name === 'starting') return;
      const request = ++state.startRequest;
      this.transition(new StartingState(this));
      view.setConnectionMessage(translate('overlayStarting'));
      this.render();
      try {
        overlayClient.launch();
        const overlayState = await this.waitForOverlay(request);
        if (request !== state.startRequest || this.lifecycle.name !== 'starting') return;
        state.overlayConnected = true;
        state.lastCommandSequence = overlayState.commandSequence || 0;
        this.startHeartbeat();
        this.pollId = setInterval(() => this.pollOverlay(), 1000);
        this.beginActive();
      } catch (error) {
        if (request !== state.startRequest) return;
        state.overlayConnected = false;
        this.transition(new HelperUnavailableState(this));
        reportError(translate('startError'), error);
      }
    }

    async waitForOverlay(request) {
      const deadline = Date.now() + 15000;
      while (Date.now() < deadline) {
        if (request !== state.startRequest) throw new Error('Overlay activation was cancelled.');
        try {
          const response = await overlayClient.requestState();
          if (response.ok) return await response.json();
        } catch (error) {
          if (!(error instanceof TypeError)) throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      throw new Error('Overlay did not respond within 15 seconds.');
    }

    async pollOverlay() {
      if (!state.overlayConnected || this.pollInFlight) return;
      this.pollInFlight = true;
      try {
        const response = await overlayClient.requestState();
        if (!response.ok) throw new Error(`Overlay returned HTTP ${response.status}`);
        const overlayState = await response.json();
        if (!state.overlayConnected) return;
        if (overlayState.commandSequence !== state.lastCommandSequence) {
          state.lastCommandSequence = overlayState.commandSequence;
          this.lifecycle.handleCommand(overlayState.command);
        }
      } catch (error) {
        this.handleHelperUnavailable(error);
      } finally {
        this.pollInFlight = false;
      }
    }

    handleHelperUnavailable(error) {
      if (!state.overlayConnected) return;
      state.overlayConnected = false;
      this.stopHeartbeat();
      this.transition(new HelperUnavailableState(this));
      reportError(translate('overlayLost'), error);
    }

    beginActive(durationMs = getDurationMs('activeSeconds')) {
      this.transition(new ActiveCountdownState(this, durationMs));
    }

    beginWarning() {
      if (this.lifecycle.name !== 'active') return;
      this.transition(new WarningState(this));
    }

    beginPause() {
      if (this.lifecycle.name !== 'warning') return;
      this.transition(new ActivePauseState(this));
    }

    pause() {
      if (this.lifecycle.name === 'active') this.lifecycle.pause();
    }

    continue() {
      if (this.lifecycle.name === 'paused') this.lifecycle.continue();
    }

    restart() {
      if (state.overlayConnected && this.lifecycle.name !== 'starting') this.lifecycle.restart();
    }

    takePause() {
      if (state.overlayConnected && this.lifecycle.name === 'active') this.lifecycle.takePause();
    }

    async deactivateOverlay() {
      if (this.lifecycle.name === 'starting') {
        state.startRequest++;
        this.transition(new InactiveState(this));
        state.overlayConnected = false;
        this.render();
        return;
      }

      this.clearCountdown();
      this.stopHeartbeat();
      state.overlayConnected = false;
      this.transition(new InactiveState(this));
      this.render();
      try {
        const response = await overlayClient.shutdown();
        if (!response.ok) throw new Error(`Overlay returned HTTP ${response.status}`);
      } catch (error) {
        reportError(translate('shutdownError'), error);
      }
    }

    async toggleOverlay() {
      if (this.lifecycle.name === 'inactive' || this.lifecycle.name === 'unavailable') {
        await this.activateOverlay();
      } else {
        await this.deactivateOverlay();
      }
    }

    pauseDuration() {
      return getDurationMs('pauseSeconds');
    }

    render() {
      view.render({
        enabled: state.enabled,
        overlayConnected: state.overlayConnected,
        lifecycleName: this.lifecycle.name,
        remainingMs: this.remainingMs(),
        translate,
        formatDuration
      });
    }
  }

  const timer = new PauseTimer();

  window.getClockContextText = function (now) {
    const century = Math.floor((now.getFullYear() - 1) / 100) + 1;
    const millennium = Math.floor((now.getFullYear() - 1) / 1000) + 1;
    return `${translate('century', { value: toRomanNumeral(century) })} · ${translate('millennium', { value: toRomanNumeral(millennium) })} · ${translate('era')}\n${translate('geology')}`;
  };

  window.getActivePauseLocale = function () {
    return getLanguage().locale;
  };

  function toRomanNumeral(value) {
    const numerals = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let result = '';
    for (const [number, numeral] of numerals) {
      while (value >= number) {
        result += numeral;
        value -= number;
      }
    }
    return result;
  }

  window.addEventListener('load', function () {
    view.initialize();
    setDocumentLanguage();
    view.bindControls({
      toggleOverlay: () => timer.toggleOverlay(),
      restart: () => timer.restart(),
      togglePause: () => {
        if (timer.lifecycle.name === 'active') timer.pause();
        else timer.continue();
      },
      takePause: () => timer.takePause()
    });
    timer.render();
  });

  const previousPropertyListener = window.livelyPropertyListener;
  window.livelyPropertyListener = function (name, value) {
    if (typeof previousPropertyListener === 'function') previousPropertyListener(name, value);
    if (name === 'language') {
      const languageIndex = Number(value);
      if (!Number.isInteger(languageIndex) || !languages[languageIndex]) {
        console.warn('Ignoring unsupported Lively language setting:', value);
        return;
      }
      state.languageIndex = languageIndex;
      setDocumentLanguage();
      if (typeof updateClock === 'function') updateClock();
      if (view.isInitialized()) timer.render();
      if (state.overlayConnected) timer.publishPhase();
    }
    if (name === 'pauseReminderEnabled') {
      const normalizedValue = typeof value === 'boolean'
        ? value
        : value === 1 || value === '1' || (typeof value === 'string' && value.toLowerCase() === 'true')
          ? true
          : value === 0 || value === '0' || (typeof value === 'string' && value.toLowerCase() === 'false')
            ? false
            : null;
      if (normalizedValue === null) {
        console.warn('Ignoring unsupported Lively pause reminder setting:', value);
        return;
      }
      state.enabled = normalizedValue;
      if (!state.enabled && timer.lifecycle.name !== 'inactive') timer.deactivateOverlay();
      else if (view.isInitialized()) timer.render();
    }
    if (name === 'pauseSchedule') {
      const numericValue = Number(value);
      if (!Number.isInteger(numericValue) || !presets[numericValue]) {
        console.warn('Ignoring unsupported Lively pause schedule setting:', value);
        return;
      }
      state.presetIndex = numericValue;
      if (state.overlayConnected) timer.restart();
    }
  };
})();
