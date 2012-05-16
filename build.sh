cd src/
haml -r "./render_file.rb" layout.haml > ../public/index.html
haml -r "./render_file.rb" readme_layout.haml > ../README.html
cp ../readme.html ../public/
cd -
coffee -o ./public/js/test -b -c test/*.coffee
coffee -o ./public/js -b -c src/*.coffee
#cp test/jquery.color.js public/js/test/
cp test/md5.js public/js/test/
cp test/test.css public/css/test/
cd test/
echo "test"
haml -r "./render_file.rb" test_layout.haml > ../public/test.html

