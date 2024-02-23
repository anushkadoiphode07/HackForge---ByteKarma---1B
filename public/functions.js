let stars = document.getElementsByClassName("stars");
function rate(n) { 
    remove();
    console.log('hello');
    for(let i=0; i<n; i++) {
        if (n == 1) cls = "one";
        else if (n == 2) cls = "two";
        else if (n == 3) cls = "three";
        else if (n == 4) cls = "four";
        else if (n == 5) cls = "five";
        else cls = "stars";
        stars[i].className = "stars " + cls;
    }
}

function remove() {
    let i = 0;
    while(i<5) {
        stars[i].className = "stars";
        i++;
    }
}

function countStars() {
    return count;
}






