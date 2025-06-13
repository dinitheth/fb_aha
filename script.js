// Note: Ensure a 'phone-frame.png' image is available in the 'assets' folder for the prank image generation.
// It should be a transparent PNG of a phone frame where the user's picture and chat can be overlaid.
// Ideal dimensions for phone-frame.png for current canvas settings: 400x700px or similar aspect ratio.

const prankMessages = [
  {
    en: "{name}, you've secretly been on someone’s mind all day.",
    si: "ඔයා නම් මට නිතරම සිහිවෙලා එනවා {name}!"
  },
  {
    en: "Someone has a huge crush on you, {name}!",
    si: "{name}, කවුද දන්නෙ නෑ ඔයාට හොරෙන් ආදරය කරන කෙනෙක් ඉන්නවා!"
  },
  {
    en: "Big news coming your way soon, {name}!",
    si: "{name}, ඔයාට ඉක්මනින්ම ලොකු ආරංචියක් එන්න තියෙනවා!"
  },
  {
    en: "{name}, your phone is about to blow up with messages!",
    si: "අද නම් {name}ගේ ෆೋನ್ එකට ஒரே மெசேஜ் மழைதான்!"
  },
  {
    en: "An admirer sent you a secret message, {name}. Check your DMs!",
    si: "{name}, ඔයාට රහස් පණිවිඩයක් ඇවිත්! ඉක්මනට බලන්න."
  },
  {
    en: "{name}, stop being so cute, it's distracting!",
    si: "{name}, ඔයා හරිම ලස්සනයි, ඒක මට කරදරයක්!"
  }
];

let currentUser = { name: '', pictureUrl: '' };

window.fbAsyncInit = function() {
  FB.init({
    appId      : 'YOUR_APP_ID', // Replace with your actual App ID
    cookie     : true,
    xfbml      : true,
    version    : 'v19.0' // Use a current API version
  });
  FB.AppEvents.logPageView();
  checkLoginState();
};

function checkLoginState() {
  FB.getLoginStatus(function(response) {
    console.log('checkLoginState response:', response);
    // Optional: if (response.status === 'connected') { fetchUserInfo(); }
  });
}

function fetchUserInfo() {
  FB.api('/me?fields=name,picture.type(large)', function(response) {
    console.log('User info response:', response);
    if (response && !response.error) {
      currentUser.name = response.name;
      currentUser.pictureUrl = response.picture.data.url;

      // Display original info (optional, for debugging)
      document.getElementById('user-name').textContent = 'Name: ' + response.name;
      document.getElementById('profile-pic').src = response.picture.data.url;
      document.getElementById('profile-pic').style.display = 'block';

      generatePrankImage(); // Generate and display the prank image

    } else {
      console.error('Error fetching user info:', response.error);
      // Handle error: show message to user, etc.
    }
  });
}

function generatePrankImage() {
  if (!currentUser.name || !currentUser.pictureUrl) {
    console.error("User data not available to generate prank image.");
    return;
  }

  const randomMessageIndex = Math.floor(Math.random() * prankMessages.length);
  const selectedMessageObj = prankMessages[randomMessageIndex];

  const selectedLang = Math.random() < 0.5 ? 'en' : 'si'; // Randomly select English or Sinhala
  let messageText = selectedMessageObj[selectedLang];

  messageText = messageText.replace('{name}', currentUser.name.split(' ')[0]); // Use first name

  drawCanvasImage(currentUser.pictureUrl, messageText);
}

function drawCanvasImage(profilePicUrl, messageText) {
  const canvas = document.createElement('canvas');
  canvas.width = 400; // Adjust as needed, ensure phone-frame.png matches aspect ratio
  canvas.height = 700; // Adjust as needed
  const ctx = canvas.getContext('2d');

  const phoneFrame = new Image();
  phoneFrame.src = 'assets/phone-frame.png'; // Ensure this path is correct

  phoneFrame.onload = () => {
    const userImage = new Image();
    userImage.crossOrigin = "Anonymous"; // Important for cross-domain images from Facebook
    userImage.src = profilePicUrl;

    userImage.onload = () => {
      // Clear canvas (good practice)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- Drawing logic assumes phone-frame.png has a transparent area for content ---

      // 1. Draw User Image (as background, potentially cropped/resized to fit a "screen" area)
      // These are example coordinates/dimensions for the user image to fill a part of the phone screen area
      // This might be the entire area where the chat and profile pic will be shown, or just a background wallpaper
      const userImageBgX = canvas.width * 0.05; // 5% from left
      const userImageBgY = canvas.height * 0.1; // 10% from top
      const userImageBgWidth = canvas.width * 0.9; // 90% of canvas width
      const userImageBgHeight = canvas.height * 0.8; // 80% of canvas height
      // Draw user image as a general background first if desired.
      // ctx.drawImage(userImage, userImageBgX, userImageBgY, userImageBgWidth, userImageBgHeight);


      // 2. Draw Phone Frame OVER everything else
      // The phone frame should ideally be a PNG with transparency in the middle.
      // If the phone frame itself contains the "chat bubble" graphics, text positioning will be relative to that.
      // If not, you'd draw chat bubbles manually. For simplicity, we assume frame is an overlay.

      // --- Simulate a chat message look ---
      // Define area for the user's small profile picture in the chat message
      const chatPicX = canvas.width * 0.1;  // Example: 10% from left inside the frame
      const chatPicY = canvas.height * 0.15; // Example: 15% from top inside the frame
      const chatPicDiameter = 60;

      // Draw circular profile picture
      ctx.save();
      ctx.beginPath();
      ctx.arc(chatPicX + chatPicDiameter / 2, chatPicY + chatPicDiameter / 2, chatPicDiameter / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(userImage, chatPicX, chatPicY, chatPicDiameter, chatPicDiameter);
      ctx.restore();

      // Text Rendering (example for a chat bubble)
      ctx.fillStyle = '#333'; // Dark grey for text
      // For Sinhala, ensure font supports it. 'Noto Sans Sinhala' is a good choice if available.
      // Browsers might fallback if Arial doesn't support all characters.
      ctx.font = "18px 'Noto Sans Sinhala', Arial, sans-serif";
      ctx.textAlign = 'left';

      // Position text next to the small profile picture (like a chat message)
      const textX = chatPicX + chatPicDiameter + 15; // 15px right of the chat pic
      const textY = chatPicY + chatPicDiameter / 2 + 6; // Vertically centered with chat pic, +6 for font baseline

      // Simple text wrapping (manual)
      const maxWidth = canvas.width * 0.85 - (textX); // Max width for text line
      wrapText(ctx, messageText, textX, textY, maxWidth, 22); // 22 is line height

      // Finally, draw the phone frame image over everything
      // This ensures the frame borders, buttons etc., are on top.
      ctx.drawImage(phoneFrame, 0, 0, canvas.width, canvas.height);

      // Display the generated image
      const dataUrl = canvas.toDataURL('image/png');
      document.getElementById('prank-image').src = dataUrl;
      document.getElementById('prank-image').style.display = 'block';

      // Ensure main app content is visible and loading screen is hidden
      document.getElementById('loading-screen').style.display = 'none';
      document.getElementById('main-app-content').style.display = 'block';
    };

    userImage.onerror = () => {
      console.error('Failed to load user profile image.');
      alert('Failed to load your profile picture. Please try again.');
      // Potentially hide loading screen and show an error message in main-app-content
      document.getElementById('loading-screen').style.display = 'none';
      document.getElementById('main-app-content').style.display = 'block';
      document.getElementById('main-app-content').innerHTML = '<p>Error loading profile image. Cannot generate prank.</p>';
    };
  };

  phoneFrame.onerror = () => {
    console.error('Failed to load phone frame image (assets/phone-frame.png).');
    alert('Critical error: Failed to load app resources (phone frame). Cannot generate prank.');
    // Potentially hide loading screen and show an error message in main-app-content
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('main-app-content').style.display = 'block';
    document.getElementById('main-app-content').innerHTML = '<p>Error loading app resources. Cannot generate prank.</p>';
  };
}

// Helper function to wrap text on canvas
function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}


document.addEventListener('DOMContentLoaded', function() {
    if (typeof FB !== 'undefined') {
        // checkLoginState(); // Already called in fbAsyncInit
    } else {
        console.warn("FB SDK not loaded yet when DOMContentLoaded fired.");
    }

    const loginButton = document.getElementById('fb-login-button');
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            console.log('Login button clicked');
            if (typeof FB !== 'undefined') {
                FB.login(function(response) {
                    console.log('FB.login response:', response);
                    if (response.authResponse) {
                        console.log('Login successful, fetching user info...');
                        fetchUserInfo();
                    } else {
                        console.log('User cancelled login or did not fully authorize.');
                    }
                }, {scope: 'public_profile,email'}); // Added email scope, though not used yet
            } else {
                console.error('FB SDK not available for login.');
                alert('Facebook integration is not ready. Please try again in a moment.');
            }
        });
    } else {
        console.error('Login button not found');
    }

    const tryAgainButton = document.getElementById('try-again-button');
    if (tryAgainButton) {
        tryAgainButton.addEventListener('click', () => {
            console.log('Try Again button clicked');
            // Call the existing function to regenerate the image
            // Ensure currentUser data is still available
            if (currentUser && currentUser.name && currentUser.pictureUrl) {
                generatePrankImage();
            } else {
                // This case should ideally not happen if "Try Again" is only shown after a successful generation
                console.error('Cannot "Try Again": User data not available.');
                alert('Something went wrong, please try logging in again.');
                 // Optionally, redirect to login or show login screen
                document.getElementById('main-app-content').style.display = 'none';
                document.getElementById('loading-screen').style.display = 'flex'; // Assuming loading screen has login
            }
        });
    } else {
        console.error('Try Again button not found');
    }

    const shareButton = document.getElementById('share-fb-button');
    if (shareButton) {
        shareButton.addEventListener('click', () => {
            console.log('Share on Facebook button clicked');
            const appUrl = window.location.href;

            if (typeof FB !== 'undefined') {
                FB.ui({
                    method: 'share',
                    href: appUrl,
                    quote: "I just made a fun prank image with PrankApp! You should try it too.",
                    hashtag: "#PrankAppFun"
                }, function(response){
                    if (response && !response.error_code) {
                        console.log('Sharing successfully completed. Response:', response);
                        // alert('Successfully shared to Facebook!'); // Optional user feedback
                    } else {
                        console.log('Sharing cancelled or an error occurred. Response:', response);
                        // alert('Sharing was cancelled or an error occurred.'); // Optional user feedback
                    }
                });
            } else {
                console.error('FB SDK not available for sharing.');
                alert('Facebook integration is not ready for sharing. Please try again in a moment.');
            }
        });
    } else {
        console.error('Share on Facebook button not found');
    }
});
