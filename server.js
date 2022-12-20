const fs = require('fs');
const http = require('http');
const path = require('path');

const port = 5001;

const server = http.createServer(function RequestListener(request, response) 
{
    if (request.method === 'GET')
    {
        // GET method on /video endpoint
        if (request.url === '/video')
        {
            StreamVideo(request, response);
        }
    }
});

server.listen(port, function()
{
    console.log(`Server started on port ${port}...`);
});

function StreamVideo(request, response)
{
    const filePath = './big_buck_bunny_480p.mp4';
    const fileStat = fs.statSync(filePath);
    const fileSize = fileStat.size;
    const range = request.headers.range;
    
    if (range)
    {
        const parts = range.replace('bytes=', '').split('-');
        const start = parseInt(parts[0]);
        const end = parts[1] ? parseInt(parts[1]) : fileSize - 1;
        const chunkSize = (end - start) + 1;

        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4',
        };
        response.writeHead(206, head); // 206 - partial content
        
        const readStream = fs.createReadStream(filePath, {
            start: start,
            end: end,
        });
        readStream.pipe(response);
    }
    else
    {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        response.writeHead(200, head);

        const readStream = fs.createReadStream(filePath);
        readStream.pipe(response);
    }
}