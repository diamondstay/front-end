
function replaceCharAt(originalString, index, stringToReplace) {
    if (index > (originalString.length - 1)) return originalString;
    return originalString.substr(0, index) + stringToReplace + originalString.substr(index + 1);
}

export default {
    replaceCharAt
};