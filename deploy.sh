#!/bin/bash
npm run build
sudo cp -r build/* /var/www/my_webapp/www/
sudo chown -R www-data:www-data /var/www/my_webapp/www/
echo "Deployment Complete! Check your domain."
