const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const port = 3000;

// Configure AWS S3
AWS.config.update({ region: 'us-east-1' }); // Update with your AWS region
const s3 = new AWS.S3();

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    // Upload file to S3
    const fileStream = fs.createReadStream(file.path);
    const params = {
      Bucket: 'finalProjectec2', // Replace with your S3 bucket name
      Key: file.originalname,
      Body: fileStream,
    };

    const uploadResult = await s3.upload(params).promise();
    console.log('File uploaded successfully:', uploadResult.Location);

    // Trigger Hadoop job (via SSH to EC2)
    const ec2InstanceIP = '54.226.47.1'; // Replace with EC2 IP
    const hadoopCommand = `hadoop jar /path-to-wordcount.jar input output`;
    const sshCommand = `ssh -i labsuser.pem ec2-user@${ec2InstanceIP} '${hadoopCommand}'`;

    exec(sshCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Hadoop job: ${error.message}`);
        return res.status(500).send('Error processing file with Hadoop.');
      }
      console.log(`Hadoop job output: ${stdout}`);
      res.send('File uploaded and processed successfully!');
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('File upload failed.');
  } finally {
    // Clean up local temp file
    if (req.file) fs.unlinkSync(req.file.path);
  }
});

// Fetch processed files from S3
app.get('/api/files', async (req, res) => {
  try {
    const params = {
      Bucket: 'finalProjectec2',
    };
    const data = await s3.listObjectsV2(params).promise();
    const files = data.Contents.map((item) => ({
      name: item.Key,
      url: `https://${params.Bucket}.s3.amazonaws.com/${item.Key}`,
    }));
    res.json(files);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).send('Failed to fetch files.');
  }
});

// Download a specific file
app.get('/api/files/:filename', async (req, res) => {
  try {
    const params = {
      Bucket: 'finalProjectec2',
      Key: req.params.filename,
    };
    const fileStream = s3.getObject(params).createReadStream();
    res.attachment(req.params.filename);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).send('Failed to download file.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});