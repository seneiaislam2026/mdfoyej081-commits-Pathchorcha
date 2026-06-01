const https = require('https');
const fs = require('fs');

const fetchURL = (url, dest) => {
    return new Promise((resolve, reject) => {
        let parsedUrl = require('url').parse(url);
        let options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.path,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            method: 'GET'
        };

        const req = https.request(options, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 303 || response.statusCode === 307) {
                // handle redirect
                fetchURL(response.headers.location, dest).then(resolve).catch(reject);
            } else if (response.statusCode === 200) {
                const file = fs.createWriteStream(dest);
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            } else {
                reject(new Error(`Failed to download ${url}, status code: ${response.statusCode}`));
            }
        });

        req.on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
        
        req.end();
    });
};

const logos = [
    { name: "du.png", url: "https://upload.wikimedia.org/wikipedia/en/thumb/3/39/University_of_Dhaka_logo.svg/512px-University_of_Dhaka_logo.svg.png" },
    { name: "ru.png", url: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/Rajshahi_University_Emblem.svg/512px-Rajshahi_University_Emblem.svg.png" },
    { name: "ju.png", url: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Jahangirnagar_University_logo.svg/512px-Jahangirnagar_University_logo.svg.png" },
    { name: "cu.png", url: "https://upload.wikimedia.org/wikipedia/en/thumb/2/23/University_of_Chittagong_logo.svg/512px-University_of_Chittagong_logo.svg.png" },
    { name: "cou.png", url: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/Comilla_University_logo.svg/512px-Comilla_University_logo.svg.png" },
    { name: "buet.png", url: "https://upload.wikimedia.org/wikipedia/en/thumb/9/96/BUET_LOGO.svg/512px-BUET_LOGO.svg.png" },
    { name: "medical.png", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Star_of_life2.svg/512px-Star_of_life2.svg.png" },
];

Promise.all(logos.map(l => fetchURL(l.url, './public/' + l.name)))
    .then(() => console.log('Successfully downloaded all university logos'))
    .catch(console.error);
