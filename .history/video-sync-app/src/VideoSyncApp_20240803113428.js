import React, { useState, useRef } from 'react';

function VideoSyncApp() {
    const [verificationCode, setVerificationCode] = useState('');
    const videoPlayerRef = useRef(null);

    const handleConnect = () => {
        fetch('http://localhost:8080/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ verificationCode })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Verification successful, start synchronized video playback
                const videoPlayer = videoPlayerRef.current;
                videoPlayer.src = data.videoUrl;
                videoPlayer.play();
                // Establish WebSocket connection for synchronization
                const socket = new WebSocket('ws://localhost:8080');
                socket.onopen = () => {
                    socket.send(JSON.stringify({ verificationCode, action: 'join' }));
                };
                socket.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    if (message.action === 'sync') {
                        videoPlayer.currentTime = message.currentTime;
                    }
                };
                videoPlayer.addEventListener('timeupdate', () => {
                    socket.send(JSON.stringify({ verificationCode, action: 'update', currentTime: videoPlayer.currentTime }));
                });
            } else {
                alert('Invalid verification code');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    };

    return (
        <div>
            <iframe ref={videoPlayerRef} src="https://player.bilibili.com/player.html?aid=你的视频ID&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="640" height="480"></iframe>
            <input 
                type="text" 
                value={verificationCode} 
                onChange={(e) => setVerificationCode(e.target.value)} 
                placeholder="Enter verification code"
            />
            <button onClick={handleConnect}>Connect</button>
        </div>
    );
}

export default VideoSyncApp;