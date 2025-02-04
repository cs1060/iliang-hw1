# iliang-hw1

### How to Run
To start, run `cd wikismart` to get to the correct folder. Then, run `npm i` to install all necessary packages needed. To start the interface, run `npm start`. There is no personal API-key you need to generate to run this interface.

### How to Use WikiSmart
On the landing page, you have the option to search for a specific Wikipedia article, or to generate a random article. Be careful while searching, because any typos will result in no generated articles (aka no matches). For example, if I wanted an article on `Santa Claus`, but I typed in `Santa Clous`, my search would yield an empty page and no article matches. However, if I type `Einstein`, I would get the article on `Albert Einstein`. Typos will yield in no generated articles, but typing a commonly known substring of the person, place, or idea you want an article on should generate a valid article (but it might not be on the exact topic you are looking for, depending on how common the substring you searched is). Finally, searches are not case sensitive, so use any form of capitalization you wish. <br>

After getting a valid article, you will get a thumbnail image (if one exists in the API JSON), an article prreview, a link to the entire Wikipedia article, as well as 5 related article links. You also have the option to continue searching for other articles, or generating random ones.

### API Used
I used Wikipedia's MediaWiki API for this project to query user and random article searches. The API was able to give me information, including article title, a preview, a thumbnail, and related links. 

### Contributions and Issues
This project was created by Ivy Liang. It took around 5-6 hours. Getting the API backend was actually the easy part; however, I would say that I could not find much documentation on the Wikipedia API, and had to rely on a single block of example code to learn. The real hard part was formatting the landing page and post-search page to be exactly how I wanted it. I attempted to use ChatGPT and gave it my code for context, but it was unhelpful and I had to do it manually. <br>

Update 02/03: I spoke with Jonas and it turns out that I did not need to code the entire interface from scratch, which I unfortunately did. When I was working on this assignment over the weekend, I was unaware that we used Windsurf in this class, and only got access to Windsurf Pro using the appropriate promo code on 02/03's class. I did use Generative AI throughout the process to debug (as noted in the previous paragraph) and to write my test suite, though I did do the majority of the coding myself. In addition, the test suite does not fully work, with only 4/6 tests passing. I found it difficult to generate tests for the random article button, and even with multiple iterations through ChatGPT, the AI tool proved to be unhelpful.