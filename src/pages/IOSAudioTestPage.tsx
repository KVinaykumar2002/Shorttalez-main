import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * MINIMAL iOS AUDIO TEST COMPONENT
 * 
 * Drop-in test page to diagnose iOS audio issues.
 * Navigate to /test-ios-audio to use this.
 * 
 * What this tests:
 * - Codec support (H.264 + AAC)
 * - User gesture requirement
 * - playsInline behavior
 * - Audio track detection
 */
export default function IOSAudioTestPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const log = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    // Log device info
    log(`User Agent: ${navigator.userAgent}`);
    log(`Platform: ${navigator.platform}`);
    log(`Standalone: ${(window.navigator as any).standalone || false}`);
  }, []);

  const handlePlay = async () => {
    const v = videoRef.current;
    if (!v) return;

    log('▶️ Play button clicked');
    
    // CRITICAL: Unmute in same user gesture
    v.muted = false;
    v.volume = 1.0;
    setIsMuted(false);
    
    log(`Video state before play: muted=${v.muted}, volume=${v.volume}, readyState=${v.readyState}`);

    try {
      await v.play();
      setIsPlaying(true);
      log('✅ Play successful, audio should work now');
      
      // Check audio after play
      setTimeout(() => {
        log(`Video state after play: muted=${v.muted}, paused=${v.paused}, currentTime=${v.currentTime.toFixed(2)}`);
      }, 500);
    } catch (err: any) {
      log(`❌ Play failed: ${err.message}`);
    }
  };

  const handlePause = () => {
    const v = videoRef.current;
    if (!v) return;
    
    v.pause();
    setIsPlaying(false);
    log('⏸️ Video paused');
  };

  const handleToggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    
    v.muted = !v.muted;
    setIsMuted(v.muted);
    log(`🔊 Mute toggled: ${v.muted ? 'MUTED' : 'UNMUTED'}`);
  };

  const checkVideoProperties = () => {
    const v = videoRef.current;
    if (!v) return;

    log('--- Video Properties ---');
    log(`Source: ${v.src}`);
    log(`Ready State: ${v.readyState} (4=HAVE_ENOUGH_DATA)`);
    log(`Muted: ${v.muted}`);
    log(`Volume: ${v.volume}`);
    log(`Paused: ${v.paused}`);
    log(`Current Time: ${v.currentTime.toFixed(2)}s`);
    log(`Duration: ${v.duration.toFixed(2)}s`);
    log(`Network State: ${v.networkState}`);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">iOS Audio Debug Test</h1>
        
        <div className="bg-card p-4 rounded-lg border">
          <h2 className="font-semibold mb-2">Test Video (H.264 + AAC)</h2>
          <video
            ref={videoRef}
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
            playsInline
            webkit-playsinline="true"
            preload="metadata"
            className="w-full rounded"
            onLoadedMetadata={() => log('📦 Video metadata loaded')}
            onCanPlay={() => log('✅ Video can play')}
            onError={(e) => log(`❌ Video error: ${e.type}`)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={handlePlay} disabled={isPlaying}>
            ▶️ Play (Unmute)
          </Button>
          <Button onClick={handlePause} disabled={!isPlaying} variant="secondary">
            ⏸️ Pause
          </Button>
          <Button onClick={handleToggleMute} variant="outline">
            {isMuted ? '🔇 Unmute' : '🔊 Mute'}
          </Button>
          <Button onClick={checkVideoProperties} variant="ghost">
            🔍 Check Properties
          </Button>
          <Button onClick={() => setLogs([])} variant="destructive">
            🗑️ Clear Logs
          </Button>
        </div>

        <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">Debug Logs:</h3>
          <div className="font-mono text-xs space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="text-muted-foreground">{log}</div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-sm space-y-2">
          <h3 className="font-semibold">📋 What to check:</h3>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Does video play when you tap Play button?</li>
            <li>Do you hear audio? (Make sure device isn't in silent mode!)</li>
            <li>Check logs for any errors</li>
            <li>Open Safari Web Inspector (Mac + iPhone connected) and check Console</li>
            <li>In Network tab, verify video loads with correct Content-Type: video/mp4</li>
          </ol>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg text-sm">
          <h3 className="font-semibold">⚠️ iOS Quirks:</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Audio MUST be unmuted in the same user gesture as play()</li>
            <li>Silent mode on device will mute ALL media</li>
            <li>Standalone webapp mode has stricter autoplay policies</li>
            <li>WebM codecs not supported - use H.264 + AAC in MP4</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
