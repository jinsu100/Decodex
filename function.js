console.log("JS 연결 성공");
function encode(){

    const input = document.getElementById("userInput").value;
    const result = btoa(String.fromCharCode(...new TextEncoder().encode(input)));
    document.getElementById("result").value = result;
    console.log("encode 실행 완료");
}

function decode(){

    const input = document.getElementById("userInput").value;
    const result = new TextDecoder().decode(new Uint8Array(atob(input).split('').map(c => c.charCodeAt(0))));
    document.getElementById("result").value = result;
    console.log("decode 실행 완료");
}