const socket = io()

// Elements
const $msgForm = document.querySelector('#msgs-form')
const $msgFormInput = $msgForm.querySelector('input')
const $msgFormButton = $msgForm.querySelector('button')
const $sendLocButton = document.querySelector('#send-loc')
const $msgs = document.querySelector('#messages')


// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = ()=>{
    // new msg element
    const $newMessage = $msgs.lastElementChild

    // height of the new msg
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight= $msgs.offsetHeight 

    // height of msg container
    const containerHeight = $msgs.scrollHeight

    // how far have i scrolled?
    const scrollOffset = $msgs.scrollTop + visibleHeight

    if((containerHeight - newMessageHeight) <= scrollOffset){
        $msgs.scrollTop = $msgs.scrollHeight
    }
}

// templates
const msgTemp = document.querySelector('#msg-template').innerHTML
const locMsgTemp = document.querySelector('#loc-msg-template').innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

socket.on('msg', (msgText)=>{
    console.log(msgText)
    const html = Mustache.render(msgTemp,{
        username:msgText.username,
        msgText:msgText.text,
        createdAt:moment(msgText.createdAt).format('h:mm a')
    })
    $msgs.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locMsg', (loc)=>{
    console.log(loc)
    const html = Mustache.render(locMsgTemp,{
        username:loc.username,
        url:loc.url,
        createdAt: moment(loc.createdAt).format('h:mm a')
    })
    $msgs.insertAdjacentHTML('beforeend', html)
    autoscroll()

})

socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})

$msgForm.addEventListener('submit', (e)=>{
    e.preventDefault()

    // disable
    $msgFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.msgs.value

    socket.emit('sendMsg',message, (error)=>{

        // enable
        $msgFormButton.removeAttribute('disabled')
        $msgFormInput.value = ''
        $msgFormInput.focus()

        if(error){
            return console.log(error)
        }

        // console.log('Message delivered!');

    })
})

$sendLocButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser!')
    }

    $sendLocButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((pos)=>{

        socket.emit('sendLoc', {
            lat:pos.coords.latitude,
            long:pos.coords.longitude
        },()=>{
            $sendLocButton.removeAttribute('disabled')
            // console.log('Location shared!');
        })

    })
})

socket.emit('join', { username, room }, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})