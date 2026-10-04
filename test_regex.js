const str = 'Available Nitrogen                                                198                             kg/ha               Low';
const regex = /(?:Available\s+)?Nitrogen(?:[^\r\n\d:]*?)[:=-]?\s*(\d+(?:\.\d+)?)/i;
console.log(str.match(regex));
