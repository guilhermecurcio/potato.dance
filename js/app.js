const frameControl = {
    source: null,
    current: 0,
    total: 123
}

const frames = []

const e = {}
e.app = $('#app')
e.body = $('body')
e.canvas = $('<canvas></canvas>', {
    id: 'potato-dance'
})
e.loader = $('<div></div>', {
    id: 'loader',
    class: 'text-center',
    css: {
        marginTop: `${(window.innerHeight / 2) - 56}px`
    },
    html: $('<i></i>', {
        class: 'fa fa-spinner fa-pulse fa-5x'
    })
})
e.player = $('#player')
e.playing = $('.playing')

$(e.app).html(e.loader)

const loadFrame = frame => new Promise((resolve, reject) => {
    let image = new Image()

    image.onload = () => {
        resolve(image)
    }

    image.src = frame
})

//animate config
const context      = e.canvas[0].getContext('2d')
const naturalSpeed = 32.5203252033
const initialSpeed = naturalSpeed * 2
const maxSpeed     = naturalSpeed / 2
var speed          = naturalSpeed

const dancePotatoDance = () => {
    e.app[0].style.height    = '330px'
    e.app[0].style.marginTop = `${(window.innerHeight / 2) - 115}px`
    e.canvas[0].style.height = '330px'

    const animate = () => {
        setTimeout(() => {
            frameControl.source = frames[frameControl.current]

            const hratio = e.canvas[0].width / frameControl.source.width
            const vratio = e.canvas[0].height / frameControl.source.height
            const ratio  = Math.min(hratio, vratio)
            const centerx = (e.canvas[0].width - frameControl.source.width * ratio) / 2
            const centery = (e.canvas[0].height - frameControl.source.height * ratio) / 2
            
            context.clearRect(0, 0, e.canvas[0].width, e.canvas[0].height)
            context.drawImage(
                frameControl.source,
                0,
                0,
                frameControl.source.width,
                frameControl.source.height,
                centerx,
                centery,
                frameControl.source.width * ratio,
                frameControl.source.height * ratio
            )
            
            frameControl.current += 1

            if (frameControl.current > frameControl.total) {
                frameControl.current = 0
            }

            if (audio !== null && audio.match(/chicken\-song/)) {
                switch (chickenBgColor) {
                    case 0:
                        $(e.body).css({ backgroundColor: 'blue' });
                        break;

                    case 1:
                        $(e.body).css({ backgroundColor: 'red' });
                        break;
                
                    default:
                        $(e.body).css({ backgroundColor: 'white' });
                        break;
                }

                chickenBgColor++;

                if (chickenBgColor > 2) {
                    chickenBgColor = 0;
                }
            }

            animate()
        }, speed)
    }

    setTimeout(() => animate(), 500)
}

$(window).on('load', async () => {
    let frame

    while (frameControl.current <= frameControl.total) {
        switch (frameControl.current.toString().length) {
            case 1:
                frame = `frames/frame_00${frameControl.current}_delay-0.04s.png`
                break
                
            case 2:
                frame = `frames/frame_0${frameControl.current}_delay-0.04s.png`
                break
                
            default:
                frame = `frames/frame_${frameControl.current}_delay-0.04s.png`
                break 
        }

        await loadFrame(frame).then((image) => {
            frames.push(image)
        })

        frameControl.current++
    }

    frameControl.current = 0
    $(e.loader).fadeOut(500, () => {
        $(e.app).html(e.canvas)
        $(e.player).css({ visibility: 'visible' }).fadeIn(500, () => {
            dancePotatoDance()
        })
    })
})

//analyzer
const analyzer = new p5.Amplitude()
var song = null
var loading = false
var audio = null
var chickenBgColor = 0;

function draw() {
    let rms = analyzer.getLevel()
    
    rms = ((naturalSpeed / 100) * (rms * 1000)) / 2;
    
    if (rms >= (initialSpeed - maxSpeed)) {
        speed = maxSpeed
    } else {
        speed = initialSpeed - rms
    }
}

$(document).on('click', '.fa-play', (el) => {
    if (loading === true) {
        return false
    }

    if (audio !== null && audio.match(/chicken\-song/)) {
        $(e.body).css({ backgroundColor: 'white' });
    }

    const title = $(el.target).parents('li').text()
    audio = $(el.target).data('audio')

    if (song !== null) {
        song.stop()
        $('.fa-stop').removeClass('fa-stop').addClass('fa-play')
    }

    $(el.target).removeClass('fa-play').addClass('fa-stop')
    $(e.playing).html('Loading <i class="fa fa-spinner fa-pulse"></i>');

    loading = true
    song    = new p5.SoundFile(audio, () => {
        loading = false
        $(e.playing).html(title)
        song.play()
        song.setLoop(true)
        analyzer.setInput(song)
        analyzer.smooth(0.9)
    })
})

$(document).on('click', '.fa-stop', (el) => {
    if (loading === true) {
        return false
    }

    $(el.target).removeClass('fa-stop').addClass('fa-play')
    $(e.playing).html('None :(');
    song.stop()

    if (audio.match(/chicken\-song/)) {
        $(e.body).css({ backgroundColor: 'white' });
    }

    audio = null
})