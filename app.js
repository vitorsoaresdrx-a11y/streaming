const API_KEY = 'a1f54eda9a5b36cf1194c3c28df0b1e2';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMWY1NGVkYTlhNWIzNmNmMTE5NGMzYzI4ZGYwYjFlMiIsIm5iZiI6MTc3NzE3NzU0Mi4xNDQsInN1YiI6IjY5ZWQ5M2M2YTBkN2NiNDVmMGQ0OGQ5MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.TIK1UZvrKNrtZqx5OrEV7bOEoPDInnmZQGQn0RnF7sA';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const IMAGE_POSTER_URL = 'https://image.tmdb.org/t/p/w500';

const endpoints = {
    trending: `${BASE_URL}/trending/movie/week?language=pt-BR`,
    topRated: `${BASE_URL}/movie/top_rated?language=pt-BR`,
    action: `${BASE_URL}/discover/movie?with_genres=28&language=pt-BR`,
    scifi: `${BASE_URL}/discover/movie?with_genres=878&language=pt-BR`
};

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`
    }
};

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Fetch Data
async function fetchMovies(url) {
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
}

// Render Hero Section
async function renderHero() {
    const movies = await fetchMovies(endpoints.trending);
    if (!movies || movies.length === 0) return;

    // Pick a random movie from top 5 trending
    const randomMovie = movies[Math.floor(Math.random() * 5)];
    
    const hero = document.getElementById('hero');
    const title = document.getElementById('hero-title');
    const overview = document.getElementById('hero-overview');

    // Remove skeleton classes
    title.classList.remove('skeleton', 'skeleton-text');
    overview.classList.remove('skeleton', 'skeleton-text');

    hero.style.backgroundImage = `url(${IMAGE_BASE_URL}${randomMovie.backdrop_path})`;
    title.textContent = randomMovie.title || randomMovie.name;
    overview.textContent = randomMovie.overview;

    // Add click event to hero play button
    const heroPlayBtn = document.querySelector('.hero-buttons .btn-primary');
    heroPlayBtn.onclick = () => openModal(randomMovie);
}

// Render Movie Rows
async function renderRows() {
    const rows = [
        { id: 'trending-row', url: endpoints.trending },
        { id: 'top-rated-row', url: endpoints.topRated },
        { id: 'action-row', url: endpoints.action },
        { id: 'scifi-row', url: endpoints.scifi }
    ];

    for (const row of rows) {
        const movies = await fetchMovies(row.url);
        const container = document.getElementById(row.id);
        container.innerHTML = ''; // Clear skeletons

        movies.forEach(movie => {
            if (!movie.poster_path) return;

            const card = document.createElement('div');
            card.className = 'movie-card';
            card.style.backgroundImage = `url(${IMAGE_POSTER_URL}${movie.poster_path})`;
            
            const rating = (movie.vote_average * 10).toFixed(0);
            
            card.innerHTML = `
                <div class="card-info">
                    <div class="card-title">${movie.title || movie.name}</div>
                    <div class="card-rating">
                        <i class="fa-solid fa-star"></i> ${rating}% Match
                    </div>
                </div>
            `;

            card.addEventListener('click', () => openModal(movie));
            container.appendChild(card);
        });
    }
}

// Modal Logic
const modal = document.getElementById('movie-modal');
const closeBtn = document.querySelector('.close-btn');

closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // Wait for transition
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
});

async function openModal(movie) {
    const modalHero = document.getElementById('modal-hero');
    const title = document.getElementById('modal-title');
    const rating = document.getElementById('modal-rating');
    const year = document.getElementById('modal-year');
    const overview = document.getElementById('modal-overview');
    const genresContainer = document.getElementById('modal-genres');

    modalHero.style.backgroundImage = `url(${IMAGE_BASE_URL}${movie.backdrop_path || movie.poster_path})`;
    title.textContent = movie.title || movie.name;
    rating.textContent = `${(movie.vote_average * 10).toFixed(0)}% Relevante`;
    
    const releaseDate = movie.release_date || movie.first_air_date;
    year.textContent = releaseDate ? releaseDate.split('-')[0] : '';
    
    overview.textContent = movie.overview || "Nenhuma sinopse disponível.";

    // Fetch details to get genres
    genresContainer.innerHTML = '';
    try {
        const res = await fetch(`${BASE_URL}/movie/${movie.id}?language=pt-BR`, options);
        const details = await res.json();
        
        if (details.genres) {
            details.genres.forEach(genre => {
                const span = document.createElement('span');
                span.className = 'genre-tag';
                span.textContent = genre.name;
                genresContainer.appendChild(span);
            });
        }
    } catch (e) {
        console.log("Could not fetch details", e);
    }

    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    renderHero();
    renderRows();
});
