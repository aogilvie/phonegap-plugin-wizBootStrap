/* WizBootStrap for PhoneGap - 
*
 * @author Ally Ogilvie
 * @copyright Wizcorp Inc. [ Incorporated Wizards ] 2012
 * @file - wizBootStrap.js
 * @about - JavaScript PhoneGap bridge for boot strapping
 *
 *
*/

var wizBootStrap = {
	// filename  -- file name relative to the app's 'www' directory
    load: function(filename, showSplashScreen) {
        return cordova.exec(null, null, "WizBootStrap", "load", [filename, showSplashScreen]);
    },

	// fileuri  -- the complete file URI for the on file
    loadFromFileURI: function(fileuri, showSplashScreen) {
        return cordova.exec(null, null, "WizBootStrap", "loadFromFileURI", [fileuri, showSplashScreen]);
    },
    
    bootstrap: function(filename) {
        window.wizBootStrap.load( filename, true );
    },
    
    downloadThenBootStrapFromURL: function(url, user, pass, onSuccess, onFailure) {
        var request = new XMLHttpRequest();
        if ( arguments.length < 2 ) {
            user = document.getElementById('usertextbox').value;
        }
        if ( arguments.length < 3 ) {
            pass = document.getElementById('passtextbox').value;
        }

        if ( window.localStorage ) {
        	window.localStorage.setItem('__wizBootSettings', 
        								JSON.stringify({ 
        									user: document.getElementById('usertextbox').value,
        									pass: document.getElementById('passtextbox').value,
        									url: document.getElementById('urltextbox').value
        								}));
        }
        
        // alert( 'Requesting: ' + url );
        
        var gotFS = function (fileSystem) {
            fileSystem.root.getFile("tmp.html", {create: true}, gotFileEntry, fail);
        }
        
        var gotFileEntry = function (fileEntry) {
            fileEntry.createWriter(function (writer) {gotFileWriter(writer, fileEntry); }, fail);
            // alert( 'Created: ' + fileEntry.fullPath \nNow will reboot using the file.');
            // sets customSettings in localStorage
            setTimeout(function () {
            	window.wizBootStrap.loadFromFileURI( fileEntry.fullPath, true );
            }, 1500);
            
        }
        
        var gotFileWriter = function (writer, fileEntry) {
	        
            writer.onwrite = function (evt) {
                console.log("write success");
                console.log("window.location.href: " + window.location.href);
                // Callback success
                onSuccess(fileEntry.fullPath);
            };
            
            writer.onerror = function (e) {
	            onFailure(e);
            }
            
            
            // If your root directory is not at www you may need to change your setup below
            // file:///var/application/sfasf879fs/Orko.app/assets/www/..


            var ua = window.navigator.userAgent.toLowerCase();
            if (ua.match(/android/)) {
                var newRelavantPath = window.location.href.match(/^.+\android_asset\/www\//)[0];
                // "../../www/"
                var replaceText = 'src="' + newRelavantPath;

                var updatedCode = request.responseText.replace(/src=\"/mg,replaceText);
                
                writer.write( updatedCode );
            } else if (ua.match(/ipad/) || ua.match(/ipod/) || ua.match(/iphone/)) {
                var newRelavantPath = window.location.href.match(/^.+\.app\/www\//)[0];
                // "../../www/"
                var replaceText = 'src="' + newRelavantPath;

                var updatedCode = request.responseText.replace(/src=\"/mg,replaceText);
                
                writer.write( updatedCode );
            } else {
                // fall through, unidentified user agent!
                alert ("unidentified user agent! -> " + ua);
            }
        }
        
        var fail = function (error) {
            var errorObject = JSON.stringify( evt );
            console.log( 'Error: ' + errorObject );
            alert( 'Error: ' + errorObject );
        }
        
        // Issue a synchronous request using false parameter.
        request.open('GET', url, false, user, pass);
        try {
            request.send();
        } catch (e) {
            alert('An exception was triggered.  Please verify the server exists and try your request again.');
            return;
        }
        
        // Synchronous handling.
        if (request.status == 200) {
            window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, gotFS, fail);
        } else if (request.status == 401) {
            alert("Incorrect username and/or password.");
        } else {
            alert("Request status: " + request.status + "\n\nRequest response text: " + request.responseText);
        }
                
        
    } 
};