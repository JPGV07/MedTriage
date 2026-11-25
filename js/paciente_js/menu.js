const menu = document.getElementById('btn-logout')

function inicio (){
    localStorage.removeItem('token');
   window.location.href = "../index.html"
}

menu.addEventListener('click', inicio)