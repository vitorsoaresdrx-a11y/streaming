const API_KEY = 'a1f54eda9a5b36cf1194c3c28df0b1e2';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMWY1NGVkYTlhNWIzNmNmMTE5NGMzYzI4ZGYwYjFlMiIsIm5iZiI6MTc3NzE3NzU0Mi4xNDQsInN1YiI6IjY5ZWQ5M2M2YTBkN2NiNDVmMGQ0OGQ5MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.TIK1UZvrKNrtZqx5OrEV7bOEoPDInnmZQGQn0RnF7sA';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const IMAGE_POSTER_URL = 'https://image.tmdb.org/t/p/w500';

const endpoints = {
    trending: `${BASE_URL}/trending/all/week?language=pt-BR`,
    topRated: `${BASE_URL}/movie/top_rated?language=pt-BR`,
    action: `${BASE_URL}/discover/movie?with_genres=28&language=pt-BR`,
    scifi: `${BASE_URL}/discover/movie?with_genres=878&language=pt-BR`,
    search: `${BASE_URL}/search/multi?language=pt-BR&include_adult=false`,
    tv: `${BASE_URL}/trending/tv/week?language=pt-BR`,
    movies: `${BASE_URL}/trending/movie/week?language=pt-BR`
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

// Search Logic
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResultsSection = document.getElementById('search-results-section');
const searchResultsRow = document.getElementById('search-results-row');
const searchQueryTitle = document.getElementById('search-query-title');

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch(searchInput.value);
    }
});

searchBtn.addEventListener('click', () => {
    performSearch(searchInput.value);
});

async function performSearch(query) {
    if (!query || query.trim() === '') {
        searchResultsSection.style.display = 'none';
        return;
    }

    const url = `${endpoints.search}&query=${encodeURIComponent(query)}`;
    const movies = await fetchMovies(url);
    
    searchQueryTitle.textContent = `Resultados para "${query}"`;
    searchResultsRow.innerHTML = '';
    
    if (movies && movies.length > 0) {
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
            searchResultsRow.appendChild(card);
        });
        searchResultsSection.style.display = 'block';
        window.scrollTo({ top: searchResultsSection.offsetTop - 100, behavior: 'smooth' });
    } else {
        searchQueryTitle.textContent = `Nenhum resultado encontrado para "${query}"`;
        searchResultsSection.style.display = 'block';
    }
}

// Modal Logic
const modal = document.getElementById('movie-modal');
const closeBtn = document.querySelector('.close-btn');
const videoModal = document.getElementById('video-modal');
const videoCloseBtn = document.querySelector('.video-close');
const videoContainer = document.getElementById('video-container');
const modalPlayBtn = document.querySelector('.modal-play');

let currentMovieId = null;

closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
});

videoCloseBtn.addEventListener('click', () => {
    videoModal.classList.remove('active');
    setTimeout(() => {
        videoModal.style.display = 'none';
        videoContainer.innerHTML = '';
    }, 300);
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    if (e.target === videoModal) {
        videoModal.classList.remove('active');
        setTimeout(() => {
            videoModal.style.display = 'none';
            videoContainer.innerHTML = '';
        }, 300);
    }
});

modalPlayBtn.addEventListener('click', playTrailer);

async function playTrailer() {
    if (!currentMovieId) return;
    
    // Check if the current title is a movie or tv show
    const type = currentMovieType || 'movie';
    
    try {
        let res = await fetch(`${BASE_URL}/${type}/${currentMovieId}/videos?language=pt-BR`, options);
        let data = await res.json();
        let videos = data.results;
        
        if (!videos || videos.length === 0) {
            res = await fetch(`${BASE_URL}/${type}/${currentMovieId}/videos`, options);
            data = await res.json();
            videos = data.results;
        }

        if (videos && videos.length > 0) {
            const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos.find(v => v.site === 'YouTube');
            
            if (trailer) {
                videoContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
                videoModal.style.display = 'block';
                setTimeout(() => {
                    videoModal.classList.add('active');
                }, 10);
            } else {
                alert('Trailer não disponível.');
            }
        } else {
            alert('Trailer não disponível.');
        }
    } catch (e) {
        console.error("Error fetching trailer:", e);
        alert('Erro ao carregar o trailer.');
    }
}

let currentMovieType = 'movie';

async function openModal(movie) {
    currentMovieId = movie.id;
    currentMovieType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
    
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

    const seriesDetails = document.getElementById('series-details');
    const seasonSelect = document.getElementById('season-select');
    const episodesList = document.getElementById('episodes-list');

    // Reset series specific UI
    seriesDetails.style.display = 'none';
    seasonSelect.innerHTML = '';
    episodesList.innerHTML = '';

    // Fetch details to get genres and seasons if it's a TV show
    genresContainer.innerHTML = '';
    try {
        const res = await fetch(`${BASE_URL}/${currentMovieType}/${movie.id}?language=pt-BR`, options);
        const details = await res.json();
        
        if (details.genres) {
            details.genres.forEach(genre => {
                const span = document.createElement('span');
                span.className = 'genre-tag';
                span.textContent = genre.name;
                genresContainer.appendChild(span);
            });
        }

        // Handle Series Seasons
        if (currentMovieType === 'tv' && details.seasons) {
            seriesDetails.style.display = 'block';
            
            details.seasons.forEach(season => {
                // Skip special seasons (usually index 0)
                if (season.season_number === 0 && details.seasons.length > 1) return;
                
                const option = document.createElement('option');
                option.value = season.season_number;
                option.textContent = season.name;
                seasonSelect.appendChild(option);
            });

            seasonSelect.onchange = () => loadEpisodes(movie.id, seasonSelect.value);
            
            // Load first season by default
            if (seasonSelect.options.length > 0) {
                loadEpisodes(movie.id, seasonSelect.options[0].value);
            }
        }
    } catch (e) {
        console.log("Could not fetch details", e);
    }

    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

async function loadEpisodes(seriesId, seasonNumber) {
    const episodesList = document.getElementById('episodes-list');
    episodesList.innerHTML = '<p style="padding: 20px; color: var(--text-secondary);">Carregando episódios...</p>';
    
    try {
        const res = await fetch(`${BASE_URL}/tv/${seriesId}/season/${seasonNumber}?language=pt-BR`, options);
        const data = await res.json();
        
        episodesList.innerHTML = '';
        
        if (data.episodes) {
            data.episodes.forEach(episode => {
                const epItem = document.createElement('div');
                epItem.className = 'episode-item';
                
                const thumb = episode.still_path 
                    ? `https://image.tmdb.org/t/p/w300${episode.still_path}` 
                    : `https://via.placeholder.com/120x68/141414/ffffff?text=Ep+${episode.episode_number}`;

                epItem.innerHTML = `
                    <div class="episode-thumb" style="background-image: url(${thumb})"></div>
                    <div class="episode-info">
                        <div class="episode-title">${episode.episode_number}. ${episode.name}</div>
                        <div class="episode-overview">${episode.overview || 'Sem descrição disponível.'}</div>
                    </div>
                `;

                epItem.onclick = () => {
                    // Logic to play specific episode trailer/video if available
                    // For now, let's just trigger the main trailer play logic
                    playTrailer();
                };
                
                episodesList.appendChild(epItem);
            });
        }
    } catch (e) {
        console.error("Error loading episodes:", e);
        episodesList.innerHTML = '<p style="padding: 20px; color: #ff4444;">Erro ao carregar episódios.</p>';
    }
}

// Navigation Logic
function showSection(type) {
    // Update active link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.textContent.toLowerCase() === type.replace('all', 'início').replace('tv', 'séries').replace('movie', 'filmes').replace('trending', 'bombando').replace('mylist', 'minha lista')) {
            link.classList.add('active');
        }
    });

    if (type === 'all') {
        searchResultsSection.style.display = 'none';
        document.querySelectorAll('.movie-row').forEach(row => row.style.display = 'block');
        searchResultsSection.style.display = 'none';
        return;
    }

    // Clear search results when switching tabs
    searchResultsSection.style.display = 'none';
    
    // For demo: Filter main rows or load specific content
    if (type === 'tv' || type === 'movie') {
        performSearchType(type);
    }
}

async function performSearchType(type) {
    const url = type === 'tv' ? endpoints.tv : endpoints.movies;
    const movies = await fetchMovies(url);
    
    searchQueryTitle.textContent = type === 'tv' ? "Séries Populares" : "Filmes Populares";
    searchResultsRow.innerHTML = '';
    
    movies.forEach(movie => {
        if (!movie.poster_path) return;
        const card = createMovieCard(movie);
        searchResultsRow.appendChild(card);
    });
    
    // Hide original rows and show result row
    document.querySelectorAll('.movie-row').forEach(row => row.style.display = 'none');
    searchResultsSection.style.display = 'block';
}

function createMovieCard(movie) {
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
    return card;
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    renderHero();
    renderRows();
});
