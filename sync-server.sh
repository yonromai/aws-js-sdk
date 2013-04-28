#!/bin/sh

ssh -i cs6262vm.pem ubuntu@ec2-54-245-187-156.us-west-2.compute.amazonaws.com 'sudo sh /home/ubuntu/HPC/divup-server/restart.sh'