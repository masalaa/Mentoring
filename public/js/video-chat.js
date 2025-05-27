const domain = 'meet.jit.si';
let api = null;

function initializeJitsiMeet(roomName, userInfo) {
    const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: document.querySelector('#meet'),
        userInfo: {
            displayName: userInfo.name,
            email: userInfo.email
        },
        interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
                'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
            ]
        }
    };

    api = new JitsiMeetExternalAPI(domain, options);
    
    api.addEventListeners({
        videoConferenceJoined: handleConferenceJoined,
        videoConferenceLeft: handleConferenceLeft
    });
}