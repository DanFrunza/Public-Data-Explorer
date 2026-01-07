const Minio = require('minio');

const endPoint = process.env.MINIO_ENDPOINT || 'minio';
const port = Number(process.env.MINIO_PORT || 9000);
const useSSL = (process.env.MINIO_USE_SSL || 'false') === 'true';
const accessKey = process.env.MINIO_ACCESS_KEY || 'minio';
const secretKey = process.env.MINIO_SECRET_KEY || 'minio123';
const bucket = process.env.MINIO_BUCKET || 'avatars';

// Internal client: used for server-side operations (putObject, ensureBucket)
const client = new Minio.Client({ endPoint, port, useSSL, accessKey, secretKey });


async function ensureBucket() {
  try {
    const exists = await client.bucketExists(bucket);
    if (!exists) {
      await client.makeBucket(bucket, 'us-east-1');
      console.log(`MinIO: created bucket ${bucket}`);
    }
  } catch (err) {
    console.warn('MinIO ensureBucket warning:', err && err.message ? err.message : err);
  }
}

function getBucketName() { return bucket; }

async function putObject(key, buffer, contentType) {
  const meta = { 'Content-Type': contentType || 'application/octet-stream' };
  await client.putObject(bucket, key, buffer, meta);
}

async function presignedGetObject(key, expirySeconds = 900) {
  return new Promise((resolve, reject) => {
    client.presignedGetObject(bucket, key, expirySeconds, (err, url) => {
      if (err) return reject(err);
      resolve(url);
    });
  });
}

module.exports = {
  client,
  ensureBucket,
  getBucketName,
  putObject,
  presignedGetObject,
};
