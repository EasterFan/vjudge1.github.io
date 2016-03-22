module Jekyll
  class BlackoutTag < Liquid::Tag
    def initialize(tag_name, text, tokens)
      super
      @text = text.strip
    end

    def render(context)
      %Q{<span class="blackout">#{@text}</span>}
    end
  end
end

Liquid::Template.register_tag('blackout', Jekyll::BlackoutTag)
