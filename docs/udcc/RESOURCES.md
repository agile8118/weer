# Understanding Deployment: Core Concepts — 2-Hour Preview Resources

This document contains all the links, commands, and config snippets referenced in the 2-hour YouTube preview of the **Understanding Deployment: Core Concepts** course.

Full 18-hour course is available on Udemy for just $14.99: [cododev.ca/udcc](https://cododev.ca/udcc)

> Purchasing through this link gives us 97% of the payment (vs. ~37% otherwise), which goes directly toward advancing education.

## Table of Contents

- [Lecture: Introduction to Weer](#lecture-introduction-to-weer)
- [Lecture: SSH Seamlessly](#lecture-ssh-seamlessly)
- [Lecture: Cleaning Up Docker Files](#lecture-cleaning-up-docker-files)
- [Lecture: Deploying Weer Natively — Installation Step](#lecture-deploying-weer-natively--installation-step)
- [Lecture: Backup & Break](#lecture-backup--break)
- [Lecture: Introduction to Pagser](#lecture-introduction-to-pagser)

---

## Lecture: Introduction to Weer

The project's GitHub repo:
https://github.com/Cododev-Technology/weer

---

## Lecture: SSH Seamlessly

In `~/.ssh/config` put:

```
Host sky
    HostName <your-server-host>
    User ubuntu
    IdentityFile ~/.ssh/udcc.pem
```

In your local machine's `.bashrc` or `.zshrc` file put:

```bash
sky() {
    if [[ $1 == upload ]]; then
        # the first argument is source (the path of a file or folder from local)
        scp -r "$2" "sky:${3:-$HOME/}"

    elif [[ $1 == download ]]; then
        # the first argument is source (the path of a file or folder from server)
        scp -r "sky:$2" "${3:-$HOME/Downloads/}"

    else
        ssh sky
    fi
}
```

---

## Lecture: Cleaning Up Docker Files

Run these to make sure all the tools are in place:

```bash
sudo apt update
sudo apt install -y vim build-essential git gdb net-tools ifstat sysstat iotop curl zip unzip
```

Replace your server's `.bashrc` file like so:

```bash
cp ~/.bashrc ~/.bashrc.bak
rm ~/.bashrc
vim ~/.bashrc
```

Then paste the following content in there:

```bash
# .bashrc

PS1='\[\033[01;33m\](\u)\[\033[00m\]:\[\033[01;34m\]\W\[\033[00m\] '

# General
alias ls='ls --color=auto'
alias sconfig='vim ~/.bashrc && . ~/.bashrc'

# Git
alias gs="git status"

# NGINX
nginx-conf() {
        cd /etc/nginx/conf.d
}

# System Stats
alias cpu-usage='mpstat 1'
alias memory-usage='free -h --human'
alias disk-free='df -h'
alias disk-speed='watch -n 1 "sudo iotop -b -n 1 | head -n 2"'
alias net-usage-graph='nload -u H -U H eno1'
alias net-usage='ifstat -i ens5 1'
alias folder-size='du -sh'

alias postgres='sudo -u postgres psql'


# Usage: file-size file.txt
#        file-size file.txt -a (-a meaning accurate)
file-size() {
    if [ "$2" = "-a" ]; then
        echo "$(du -b "$1" | cut -f1) bytes"
    else
        du -bh "$1"
    fi
}
```

---

## Lecture: Deploying Weer Natively — Installation Step

All setup commands ran:

```bash
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.6/install.sh | bash
# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"
# Download and install Node.js:
nvm install 24
# Verify the Node.js version:
node -v # Should print "v24.18.1".
# Download and install Yarn:
corepack enable yarn
# Verify Yarn version:
yarn -v
```

```bash
# Install postgres
sudo apt install postgresql

# Install redis
sudo apt-get install lsb-release curl gpg
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
sudo chmod 644 /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update
sudo apt-get install redis

# Install PM2
npm i -g pm2
```

```sql
-- Setting a password for the database
ALTER USER postgres PASSWORD 'password1234';
```

---

## Lecture: Backup & Break

Links:

- https://aws.amazon.com/ebs/pricing/
- https://docs.aws.amazon.com/ebs/latest/userguide/how_snapshots_work.html
- https://repost.aws/questions/QUa1D4fJPWTzK5DTb3m0gkDw/full-snapshot-size-much-larger-than-expected-costs-rapidly-escalated

---

## Lecture: Introduction to Pagser

Pagser Project:
https://github.com/agile8118/pagser
