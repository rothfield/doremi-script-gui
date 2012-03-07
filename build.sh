cd src/
haml -r "./render_file.rb" layout.haml > ../public/index.html
haml -r "./render_file.rb" readme_layout.haml > ../README.html
cp ../readme.html ../public/
cd -
coffee -o ./public/js -b -c src/*.coffee
