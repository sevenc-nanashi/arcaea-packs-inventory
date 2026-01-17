# frozen_string_literal: true
require "http"
require "uri"
require "json"

src = File.expand_path("../src", __dir__)

songs_data = JSON.parse(File.read("#{src}/songs.json"), symbolize_names: true)
english_titles_path = "#{src}/englishTitles.json"
current_english_titles = JSON.parse(File.read(english_titles_path))

songs_data.each_with_index do |song, index|
  next if current_english_titles.key?(song[:text_id])
  puts "Fetching English title for #{URI.decode_uri_component(song[:text_id])}... (#{index + 1}/#{songs_data.size})"
  page = HTTP.get("https://wikiwiki.jp/arcaea/#{song[:text_id]}")
  if page.code != 200
    puts "  Failed to fetch page (HTTP #{page.code})"
    next
  end
  page_html = page.to_s

  current_english_titles[song[:text_id]] = page_html.match(
    /英語版タイトル「(.+?)」/
  )&.[](1)
  File.write(english_titles_path, JSON.pretty_generate(current_english_titles) + "\n")
  sleep 1
end
