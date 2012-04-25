def render_file(filename)
    contents = File.read(filename)
      Haml::Engine.new(contents).render
end

