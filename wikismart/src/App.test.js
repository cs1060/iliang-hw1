import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Wikismart from './Wikismart';

// Mock the global fetch function before each test
beforeEach(() => {
  global.fetch = jest.fn();
});

test('displays article title, snippet, and image when data is fetched', async () => {
  const mockArticle = {
    title: 'Albert Einstein',
    extract: 'Albert Einstein was a German-born theoretical physicist...',
    link: 'https://en.wikipedia.org/wiki/Albert%20Einstein',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Einstein_1921_by_F_Schmutzer_-_restoration.jpg'
  };

  const mockArticleResponse = {
    query: {
      search: [
        { title: 'Albert Einstein', snippet: 'Albert Einstein was a German-born theoretical physicist...', pageid: 123 }
      ]
    }
  };

  const mockImageResponse = {
    query: {
      pages: {
        123: {
          thumbnail: { source: mockArticle.image }
        }
      }
    }
  };

  // Mock the fetch responses for article and image
  fetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockArticleResponse) });  // For article search
  fetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockImageResponse) });    // For image fetch

  // Render the component
  render(<Wikismart />);

  // Input and search action
  const searchInput = screen.getByPlaceholderText('Search Wikipedia...');
  fireEvent.change(searchInput, { target: { value: 'Albert Einstein' } });
  fireEvent.click(screen.getByText('Search'));

  // Wait for article title, snippet, and image to appear
  await waitFor(() => screen.getByText(mockArticle.title));

  // Assertions for the article
  expect(screen.getByText(mockArticle.title)).toBeInTheDocument();

  // Use a regex to match part of the snippet text, allowing flexibility
  expect(screen.getByText(/German-born theoretical physicist/i)).toBeInTheDocument();

  expect(screen.getByAltText(mockArticle.title)).toHaveAttribute('src', mockArticle.image);
  expect(screen.getByText('Read more on Wikipedia →')).toHaveAttribute('href', mockArticle.link);

  // Wait for the related articles section to appear
  // expect(screen.getByText('Related Articles')).toBeInTheDocument();
});

test('generates a random article when clicking the random button', async () => {
  const mockRandomArticle = {
    query: {
      random: [{ title: 'Quantum Mechanics', pageid: 567 }]
    }
  };

  const mockArticleResponse = {
    query: {
      search: [
        { title: 'Quantum Mechanics', snippet: 'Quantum mechanics is a fundamental theory in physics...' }
      ]
    }
  };

  // Mock the fetch response for the random article
  fetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockRandomArticle) })
       .mockResolvedValueOnce({ json: () => Promise.resolve(mockArticleResponse) });

  // Render the component
  render(<Wikismart />);

  // Simulate clicking the Random button
  fireEvent.click(screen.getByText('Random 🎲'));

  // Wait for the article to be displayed
  await waitFor(() => screen.getByText('Quantum Mechanics'));

  // Assert that the random article title is displayed
  expect(screen.getByText('Quantum Mechanics')).toBeInTheDocument();
  
  // Check if the snippet of the article is displayed
  expect(screen.getByText(/Quantum mechanics is a fundamental theory in physics/)).toBeInTheDocument();

  // Assert that the "Read more on Wikipedia" link is present and has the correct URL
  const readMoreLink = screen.getByText('Read more on Wikipedia →');
  expect(readMoreLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Quantum_Mechanics');
});