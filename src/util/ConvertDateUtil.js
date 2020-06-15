const dec2bin = (dec) => {
    const bin = str.parseInt(dec.split('').reverse().join(''), 2)
    return bin
}

export default {
    dec2bin
}