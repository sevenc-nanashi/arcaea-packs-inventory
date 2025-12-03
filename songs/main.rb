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
songs_data = JSON.parse(File.read("./songs.json"), symbolize_names: true)
next_index = (songs_data.map { |s| s[:index] }.max || -1) + 1
content.children.each do |child|
  if child.matches?("h2")
    anchor = child.at_css("a.anchor_super[name]")
    pack_name = anchor ? anchor["name"] : nil
    if pack_name.nil?
      raise "Pack name not found"
    elsif pack_name == "aprilfools"
      current_pack = nil
    else
      current_pack = pack_name
      puts "Pack: #{pack_name || "(ignore)"}"
    end
  elsif (table = child.at_css("table"))
    next if current_pack.nil?

    table
      .css("tbody tr")
      .each_with_index do |row, index|
        next if index.zero?

        cells = row.css("td")
        next if cells.size < 4

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
          has_eternal: has_eternal,
          has_beyond: has_beyond
        }
        songs_data.reject! { |s| s[:text_id] == text_id }
        songs_data << song_entry
      end
  end
end
songs_data.sort_by! { |s| s[:index] }
File.write("./songs.json", JSON.pretty_generate(songs_data))
