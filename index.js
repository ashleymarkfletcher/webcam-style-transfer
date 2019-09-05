// The width and height of the captured photo. We will set the
// width to the value defined here, but the height will be
// calculated based on the aspect ratio of the input stream.

var width = 320 // We will scale the photo width to this
var height = 0 // This will be computed based on the input stream

// |streaming| indicates whether or not we're currently streaming
// video from the camera. Obviously, we start at false.

var streaming = false

var hasContentImg = false
var hasStyleImage = false

// The various HTML elements we need to configure or control. These
// will be set by the startup() function.

var video = null
var camCanvas = null
var photo = null
var startbutton = null

function clearAll() {}

function switchCamera() {
  var facingMode = 'user'

  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: facingMode }, audio: false })
    .then(function(stream) {
      video.srcObject = stream
      video.play()
    })
    .catch(function(err) {
      console.log('An error occurred: ' + err)
    })
}

function startup() {
  video = document.getElementById('video')
  camCanvas = document.getElementById('canvas')
  photo = document.getElementById('photo')
  startbutton = document.getElementById('startbutton')

  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: 'user' }, audio: false })
    .then(function(stream) {
      video.srcObject = stream
      video.play()
    })
    .catch(function(err) {
      console.log('An error occurred: ' + err)
    })

  video.addEventListener(
    'canplay',
    function(ev) {
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth / width)

        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.

        if (isNaN(height)) {
          height = width / (4 / 3)
        }

        // resize everything to match the input video
        video.setAttribute('width', width)
        video.setAttribute('height', height)
        camCanvas.setAttribute('width', width)
        camCanvas.setAttribute('height', height)
        contentImg.setAttribute('width', width)
        contentImg.setAttribute('height', height)
        styleImg.setAttribute('width', width)
        styleImg.setAttribute('height', height)
        canvas.setAttribute('width', width)
        canvas.setAttribute('height', height)

        // resizing cleras the colour?
        // add it back in again
        ctx.fillStyle = '#AAA'
        ctx.fillRect(0, 0, camCanvas.width, camCanvas.height)

        streaming = true
      }
    },
    false
  )

  startbutton.addEventListener(
    'click',
    function(ev) {
      takepicture()
      ev.preventDefault()
    },
    false
  )

  clearphoto()
}

// Fill the photo with an indication that none has been
// captured.

function clearphoto() {
  var context = camCanvas.getContext('2d')
  context.fillStyle = '#AAA'
  context.fillRect(0, 0, camCanvas.width, camCanvas.height)

  var data = camCanvas.toDataURL('image/png')
  photo.setAttribute('src', data)
  contentImg.setAttribute('src', data)
  styleImg.setAttribute('src', data)
  styleImg.setAttribute('src', data)

  ctx.fillStyle = '#AAA'
  ctx.fillRect(0, 0, camCanvas.width, camCanvas.height)
  //   ctx.width=camCanvas.width
  //   ctx.height=camCanvas.height
}

// Capture a photo by fetching the current contents of the video
// and drawing it into a canvas, then converting that to a PNG
// format data URL. By drawing it on an offscreen canvas and then
// drawing that to the screen, we can change its size and/or apply
// other changes before drawing it.

function takepicture() {
  var context = camCanvas.getContext('2d')
  if (width && height) {
    camCanvas.width = width
    camCanvas.height = height
    context.drawImage(video, 0, 0, width, height)

    var data = camCanvas.toDataURL('image/webp')

    if (!hasContentImg) {
      photo.setAttribute('src', data)
      contentImg.setAttribute('src', data)
      hasContentImg = true
    } else if (!hasStyleImage) {
      styleImg.setAttribute('src', data)
      startLoading()
      stylize()
    } else {
      hasContentImg = false
      hasStyleImage = false
      contentImg.setAttribute('src', null)
      styleImg.setAttribute('src', null)
    }
  } else {
    clearphoto()
  }
}

// Set up our event listener to run the startup process
// once loading is complete.
window.addEventListener('load', startup, false)

// ------------------------------ MAGENTA CODE ---------------
// ------------------------------ MAGENTA CODE ---------------
// ------------------------------ MAGENTA CODE ---------------

const model = new mi.ArbitraryStyleTransferNetwork()
const canvas = document.getElementById('stylized')
const ctx = canvas.getContext('2d')
const contentImg = document.getElementById('content')
const styleImg = document.getElementById('style')
const loading = document.getElementById('loading')
const notLoading = document.getElementById('ready')

setupDemo()

function setupDemo() {
  model.initialize().then(() => {
    // stylize()
    document.getElementById('loaded-text').innerHTML = 'model loaded'

    console.log('model loaded')
  })
}

async function clearCanvas() {
  // Don't block painting until we've reset the state.
  await mi.tf.nextFrame()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  await mi.tf.nextFrame()
}

async function stylize() {
  await clearCanvas()

  // Resize the canvas to be the same size as the source image.
  canvas.width = contentImg.width
  canvas.height = contentImg.height

  console.log('wh: ', contentImg.width, contentImg.height)

  // This does all the work!
  // amount of style applied from 0-1
  model.stylize(contentImg, styleImg, 1).then(imageData => {
    stopLoading()
    ctx.putImageData(imageData, 0, 0)
    ctx.scale(1, 1)
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height)
    console.log('image styled')
  })
}

// function loadImage(event, imgElement) {
//   const reader = new FileReader()
//   reader.onload = e => {
//     imgElement.src = e.target.result
//     startLoading()
//     stylize()
//   }
//   reader.readAsDataURL(event.target.files[0])
// }

// function loadContent(event) {
//   loadImage(event, contentImg)
// }

// function loadStyle(event) {
//   loadImage(event, styleImg)
// }

function startLoading() {
  //   loading.hidden = false
  //   notLoading.hidden = true
  //   canvas.style.opacity = 0
}

function stopLoading() {
  //   loading.hidden = true
  //   notLoading.hidden = false
  //   canvas.style.opacity = 1
}
