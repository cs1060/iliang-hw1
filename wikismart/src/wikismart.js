import React, { useState } from "react";

export default function Wikismart() {
  const [query, setQuery] = useState("");
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [searched, setSearched] = useState(false);

  const fetchArticle = async (title) => {
    const wikiSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(title)}&utf8=1&origin=*`;

    try {
        const response = await fetch(wikiSearchUrl);
        const data = await response.json();
        console.log("Wikipedia Search API Response:", data.query.search[0]); // Debugging step

        if (!data.query.search.length) {
            throw new Error("No results found.");
        }

        // Extract snippet
        const firstResult = data.query.search[0];

        // Ensure the first result closely matches / is included in the input query
        if (!firstResult.title.toLowerCase().includes(title.toLowerCase())) {
          throw new Error(`No close match found for "${title}". Try refining your search.`);
        }

        // Convert snippet to plaintext article preview
        var plainSnippet = firstResult.snippet.replace(/<\/?[^>]+(>|$)/g, "");
        plainSnippet = `${plainSnippet}...`;

        // Thumbnail
        const wikiImageUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&pithumbsize=400&pageids=${firstResult.pageid}&origin=*`;
        const imageResponse = await fetch(wikiImageUrl);
        const imageData = await imageResponse.json();
        const page = imageData.query.pages[firstResult.pageid];
        const imageUrl = page?.thumbnail?.source || null;

        console.log(page)

        setArticle({
            title: firstResult.title,
            extract: plainSnippet || "No summary available.",
            link: `https://en.wikipedia.org/wiki/${encodeURIComponent(firstResult.title)}`,
            image: imageUrl || null
        });

        fetchRelatedArticles(title);

    } catch (error) {
        console.error("Error fetching article.");
        setArticle(null);
        setRelated([]);
    }
  };

  const fetchRelatedArticles = async (title) => {
    const searchApiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(title)}&srlimit=5&origin=*`;

    try {
      const response = await fetch(searchApiUrl);
      const data = await response.json();
      const searchResults = data.query.search;

      setRelated(
        searchResults.map((item) => ({
          title: item.title,
          link: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        }))
      );
    } catch (error) {
      setRelated([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchArticle(query);
      setSearched(true);
    }
  };

  const fetchRandomArticle = async () => {
    const randomApiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=random&rnlimit=10&origin=*`;

    try {
      const response = await fetch(randomApiUrl);
      const data = await response.json();
      let randomArticles = data.query.random;

      // Filter out unwanted titles
      randomArticles = randomArticles.filter((item) => !item.title.includes(":"));

      if (randomArticles.length === 0) {
        throw new Error("No valid random articles found.");
      }

      const randomTitle = randomArticles[0].title;

      setQuery(randomTitle);
      fetchArticle(randomTitle);
      setSearched(true);
    } catch (error) {
      console.error("Error fetching random article:", error);
    }
  };

  return (
    <div className="page-container">
      <div className="header-container">
        {/* Search Header */}
        <text className="logo" style={{fontSize: searched ? "25px" : "30px"}}>🔎 WikiSmart 📚</text>
        <div className={`search-container ${searched ? "horizontal" : ""}`}>
            <form onSubmit={handleSearch} className="search-box">
              <input
                type="text"
                placeholder="Search Wikipedia..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
                <button type="submit">Search</button>
                <button type="button" onClick={fetchRandomArticle} className="random-btn">
                  Random 🎲
                </button>
            </form>
        </div>
      </div>

      <div className="main-container">
        <div className="content-container">
          {/* Article Preview and Link */}
          {article && (
            <div className="article-container">
              {article.thumbnail && <img src={article.thumbnail} alt={article.title} />}
              <h2>{article.title}</h2>
              {article.image && <img src={article.image} alt={article.title} style={{ maxWidth: '30%', height: '30%'}} />}
              <p className="article-summary"><b>Article Preview: </b>{article.extract}</p>
              <a href={article.link} target="_blank" rel="noopener noreferrer">
                Read more on Wikipedia →
              </a>
            </div>
          )}

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="related-container">
              <h3>Related Articles</h3>
              <ul>
                {related.map((item) => (
                  <li key={item.title}>
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
