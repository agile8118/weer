#!/bin/bash
export PATH="$PATH:/home/ec2-user/.nvm/versions/node/v12.18.3/bin:/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/home/ec2-user/.local/bin:/home/ec2-user/bin"

echo About to stop pm2
pm2 delete url_shortener || true
