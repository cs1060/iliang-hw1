import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Wikismart from "./Wikismart";

// Mock fetch to avoid actual API calls
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

test("renders WikiSmart component", () => {
  render(<Wikismart />);
  expect(screen.getByText(/WikiSmart/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Search Wikipedia...")).toBeInTheDocument();
});

test("updates input field on change", () => {
  render(<Wikismart />);
  const input = screen.getByPlaceholderText("Search Wikipedia...");
  
  fireEvent.change(input, { target: { value: "Einstein" } });
  expect(input.value).toBe("Einstein");
});

test('displays article title, snippet, and image when data is fetched from user search', async () => {
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

test("clears article and related articles on invalid search", async () => {
  fetch.mockResolvedValueOnce({
    json: async () => ({ query: { search: [] } }),
  });

  render(<Wikismart />);
  fireEvent.change(screen.getByPlaceholderText("Search Wikipedia..."), { target: { value: "santa clous" } });

  fireEvent.submit(screen.getByRole("form"));

  await waitFor(() => expect(screen.queryByText("Related Articles")).not.toBeInTheDocument());
  expect(screen.queryByText("Read more on Wikipedia →")).not.toBeInTheDocument();
});

test("clicking 'Random' fetches and displays a random article", async () => {
  fetch
    .mockResolvedValueOnce({
      json: async () => ({
        query: {
          random: [{ title: "Quantum Mechanics", pageid: 456 }]
        }
      })
    })
    .mockResolvedValueOnce({
      json: async () => ({
        query: {
          search: [{ title: "Quantum Mechanics", snippet: "A fundamental theory...", pageid: 456 }]
        }
      })
    });

  render(<Wikismart />);
  
  fireEvent.click(screen.getByText("Random 🎲"));

  await waitFor(() => expect(screen.getByText("Quantum Mechanics")).toBeInTheDocument());
});

test("handles error when fetching a random article fails", async () => {
  fetch.mockRejectedValueOnce(new Error("Failed to fetch"));

  render(<Wikismart />);
  
  fireEvent.click(screen.getByText("Random 🎲"));

  await waitFor(() => expect(screen.queryByText("Read more on Wikipedia →")).not.toBeInTheDocument());
});
