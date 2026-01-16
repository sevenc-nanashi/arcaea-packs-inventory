# frozen_string_literal: true
require "http"
require "nokogiri"
require "json"

packs_html =
  HTTP.get(
    "https://wikiwiki.jp/arcaea/%E3%83%91%E3%83%83%E3%82%AF%E9%A0%86"
  ).to_s
packs_doc = Nokogiri.HTML(packs_html)
content = packs_doc.at_css("#content")
current_pack = nil
current_pack_append = nil
songs_data = JSON.parse(File.read("../src/songs.json"), symbolize_names: true)
packs = []
fallback_pack_names = { "memoryarchive" => "Memory Archive" }
next_index = (songs_data.map { |s| s[:index] }.max || -1) + 1

category = :arcaea
category_names = {
  arcaea: "Arcaea",
  main_story_1: "Main Story Act I",
  main_story_2: "Main Story Act II",
  side_story: "Side Story",
  collaboration: "Collaboration"
}

content.children.each do |child|
  if child.matches?("h2")
    anchor = child.at_css("a.anchor_super[name]")
    pack_id = anchor ? anchor["name"] : nil
    if pack_id.nil?
      raise "Pack name not found"
    elsif pack_id == "aprilfools"
      current_pack = nil
    else
      current_pack = pack_id
      current_pack_append = nil
      title = child.text.match(/^"(.+)" Pack/)&.[](1)
      if title.nil?
        title = fallback_pack_names[pack_id] or
          raise("Title not found for pack #{pack_id}")
      end
      packs << { text_id: pack_id, title:, category:, appends: [] }
      case pack_id
      when "extend1"
        category = :main_story_2
      when "lasting"
        category = :main_story_1
      when "eternalcore"
        category = :side_story
      when "crimsonsolace"
        category = :collaboration
      end
      puts "Pack: #{title} (ID: #{pack_id})"
    end
  elsif (table = child.at_css("table"))
    next if current_pack.nil?

    table
      .css("tbody tr")
      .each_with_index do |row, index|
        next if index.zero?

        maybe_header = row.at_css("th[colspan=10]")
        if maybe_header
          append_text = maybe_header.at_css("strong")&.text
          if maybe_header.text.strip.start_with?("Silent Answer")
            # Final VerdictとSilent Answerは同じパックとしてみなす
            current_pack_append = nil
            next
          elsif append_text.nil?
            raise "Subpack header strong text not found"
          end
          append_title = append_text&.match(/^"(.+)" Pack Append/)&.[](1)
          if append_title
            puts "  Subpack: #{append_title}"
          elsif maybe_header.text.strip.include?("にて削除")
            # Particle Artsくん...
            puts "  Subpack: (removed)"
            current_pack = nil
            current_pack_append = nil
            next
          else
            raise "Subpack title not found"
          end

          current_pack_append = append_title.downcase.gsub(/\s+/, "_")
          packs.last[:appends] << {
            text_id: current_pack_append,
            title: append_title
          }
        else
          next unless current_pack
          cells = row.css("td")
          if cells.size < 10
            if cells.size == 1 &&
                 row.previous_element&.at_css("td").text.strip == "Last"
              # Last | Eternityは面倒な構造をしている...
              next
            end
            raise "Unexpected number of cells in row: #{cells.size}"
          end

          song_title = cells[0].text.strip
          has_eternal = !cells[8].text.empty?
          has_beyond = !cells[9].text.empty?
          text_id = cells[0].at_css("a")["href"].split("/").last
          puts "  Song: #{song_title} (ID: #{text_id})"
          puts "    Eternal: #{has_eternal}"
          puts "    Beyond: #{has_beyond}"
          index =
            if (existing = songs_data.find { |s| s[:text_id] == text_id })
              existing[:index]
            else
              next_index += 1
              next_index - 1
            end
          song_entry = {
            index: index,
            text_id: text_id,
            title: song_title,
            pack: current_pack,
            pack_append: current_pack_append,
            has_eternal: has_eternal,
            has_beyond: has_beyond
          }
          songs_data.reject! { |s| s[:text_id] == text_id }
          songs_data << song_entry
        end
      end
  end
end
songs_data.sort_by! { |s| s[:index] }
File.write(
	"../src/categories.json",
  JSON.pretty_generate(
    packs
      .group_by { |p| p[:category] }
      .map do |cat, ps|
        {
          text_id: cat.to_s,
          title: category_names[cat],
          packs:
            ps.map do |p|
              { text_id: p[:text_id], title: p[:title], appends: p[:appends] }
            end
        }
      end
  )
)
File.write("../src/songs.json", JSON.pretty_generate(songs_data))
