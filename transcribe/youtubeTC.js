// convert hh:mm:ss timecode to youtube syntax
// e.g. 01:59:59 ---> <link>?t=1h59m59s
// e.g. 00:59:59 ---> <link>?t=59m59s
// e.g. 00:00:59 ---> <link>?t=59s

// https://youtu.be/c9YFYKRcNzY "More Closure/Recursion"

const hms_eg0 = '00:00:00'
const hms_eg1 = '00:00:59'
const hms_eg2 = '00:59:59'
const hms_eg3 = '01:59:59'

const youTubeTC = ['?t=', 'h', 'm', 's'];

const convertToYouTube = (str, link) => {
  const hmsArr = str.split(':');
  console.log(hmsArr);
  // console.log(hmsArr[0] === '00' && hmsArr[1] === '00' && hmsArr[2] !== '00')

  let string = youTubeTC[0]
  for (i = 0; i < hmsArr.length; i++) {
    string += hmsArr[i];
    // console.log(string);
    string += youTubeTC[i + 1];
    // console.log(string);
  }
  result = link + string;
  // console.log(result);
  return result;


  // TODO: remove 00's from string
  // if (hmsArr.length !== 3) {
  //   console.log('non-standard timecode syntax, please use hh:mm:ss');
  // }
  //
  // switch (hmsArr.length === 3) {
  //   case (hmsArr[0] === '00' && hmsArr[1] === '00' && hmsArr[2] !== '00'):
  //     console.log('seconds only');
  //   break;
  //
  //   case (hmsArr[0] === '00' && hmsArr[1] !== '00' && hmsArr[2] !== '00'):
  //     console.log('minutes and seconds');
  //   break;
  //
  //   case (hmsArr[0] !== '00' && hmsArr[1] !== '00' && hmsArr[2] !== '00'):
  //     console.log('hours, minutes, and seconds');
  //     let str = youTubeTC[0]
  //     for (i = 0; i < hmsArr.length; i++) {
  //       str += hmsArr[i];
  //       // console.log(str);
  //       str += youTubeTC[i + 1];
  //       // console.log(str);
  //     }
  //     result = link + str;
  //     // console.log(result);
  //     return result;
  //   break;
  //
  //   default:
  //     // console.log(link);
  //     return link;
  //   break;
  // }
};

console.log(convertToYouTube(hms_eg0, 'youtu.be/link'));
console.log(convertToYouTube(hms_eg1, 'youtu.be/link'));
console.log(convertToYouTube(hms_eg2, 'youtu.be/link'));
console.log(convertToYouTube(hms_eg3, 'youtu.be/link'));
