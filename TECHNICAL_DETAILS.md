# Technical Implementation Details

## Backend Architecture

### Database → API → Frontend Flow

#### 1. Database Schema (MySQL)

```sql
CREATE TABLE houses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(500),  -- Can store URL or filename
  bedrooms INT NOT NULL,
  bathrooms INT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. Backend API Layer

**File**: `backend/routes/api.js` (Lines 6-27)

```javascript
router.get("/api/houses", async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = "SELECT * FROM houses";
    const params = [];

    if (search) {
      query += " WHERE location LIKE ? OR name LIKE ?";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [houses] = await db.query(query, params);
    res.json(houses); // Returns array of house objects with all fields
  } catch (err) {
    console.error("Error fetching houses:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
```

**Features**:

- ✅ Full SELECT query returns all columns
- ✅ Search filtering by location or name
- ✅ Pagination support (page, limit)
- ✅ JSON response format
- ✅ Error handling

#### 3. Static File Serving

**File**: `backend/server.js` (Line 14)

```javascript
app.use(express.static("../public"));
```

This enables serving of:

- `/house-1.jpg` → serves from `public/house-1.jpg`
- `/kilimani.jpg` → serves from `public/kilimani.jpg`
- etc.

---

## Frontend React Implementation

### Component Structure

#### Main App Component

**File**: `src/components/App.jsx` (Lines 450+)

```javascript
const App = () => {
  const [houses, setHouses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  // ... other state

  useEffect(() => {
    axios.get('/api/houses')
      .then(response => setHouses(response.data))
      .catch(error => console.error('Error fetching houses:', error));
  }, []);  // Runs once on mount

  return (
    <StrictMode>
      <Header ... />
      {view === 'list' && <ListingView houses={houses} ... />}
      {view === 'detail' && selectedHouse && <HouseDetailView house={selectedHouse} ... />}
      {/* ... other views */}
    </StrictMode>
  );
};
```

**Key Points**:

- ✅ Fetches data on component mount
- ✅ Stores houses in state
- ✅ Passes houses to ListingView
- ✅ Default axios baseURL: `http://localhost:5000`

---

### HouseCard Component (Updated)

**File**: `src/components/App.jsx` (Lines 40-90)

**New Feature**: Smart image URL handling

```javascript
const HouseCard = ({ house, onSelect }) => {
  // NEW: Smart image URL handler
  const getImageURL = (imageUrl) => {
    // Case 1: Missing or empty
    if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
      return "https://placehold.co/600x400/D1D5DB/1F2937?text=Image+Unavailable";
    }

    // Case 2: Absolute URL (starts with http/https)
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl; // Use as-is
    }

    // Case 3: Relative path
    const path = imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl;
    return path; // Will be served by Express.static
  };

  return (
    <div className="..." onClick={() => onSelect(house)}>
      <img
        src={getImageURL(house.image)}
        alt={house.name}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src =
            "https://placehold.co/600x400/D1D5DB/1F2937?text=Image+Unavailable";
        }}
      />
      <div className="p-4">
        <h3>{house.name}</h3>
        <p>{house.location}</p>
        <p>
          {CURRENCY} {house.price.toLocaleString()} / night
        </p>
        <p>
          {house.bedrooms} Beds | {house.bathrooms} Baths
        </p>
      </div>
    </div>
  );
};
```

**Image URL Processing Logic**:

```
Input: house.image from database
  ↓
getImageURL(house.image)
  ├─ Check if null/empty?
  │  └─ YES: Return placeholder URL
  │  └─ NO: Continue
  ├─ Check if starts with http?
  │  └─ YES: Return as-is (external URL)
  │  └─ NO: Continue
  └─ Return as relative path (prepend / if needed)
     └─ Browser requests /filename.jpg
     └─ Express serves from public/filename.jpg
```

---

### HouseDetailView Component (Updated)

**File**: `src/components/App.jsx` (Lines 132-210)

```javascript
const HouseDetailView = ({
  house,
  setView,
  selectedNights,
  setSelectedNights,
}) => {
  const totalCost = house.price * selectedNights;
  const fee = totalCost * 0.05;
  const finalTotal = totalCost + fee;

  // Same smart image handler as HouseCard
  const getImageURL = (imageUrl) => {
    /* ... */
  };

  return (
    <div className="max-w-4xl mx-auto">
      <img
        src={getImageURL(house.image)}
        className="w-full h-80 object-cover"
      />
      <h2>{house.name}</h2>
      <p>{house.location}</p>
      <div>
        <p>
          <strong>Beds:</strong> {house.bedrooms}
        </p>
        <p>
          <strong>Baths:</strong> {house.bathrooms}
        </p>
        <p>
          <strong>Capacity:</strong> {house.bedrooms * 2} Guests
        </p>
        <p>
          <strong>Description:</strong> {house.description}
        </p>
      </div>
      {/* Booking form with night selection and payment */}
    </div>
  );
};
```

---

## Data Flow Visualization

### Complete Request/Response Cycle

```
User Opens App
  ↓
React App Mounts → useEffect Hook
  ↓
axios.get('/api/houses')  [HTTP GET to backend]
  ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BACKEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ↓
Express Route Handler: router.get('/api/houses')
  ↓
Query Database: SELECT * FROM houses
  ↓
Database Returns:
  [
    {
      "id": 1,
      "name": "Cozy Nairobi Studio",
      "location": "Nairobi",
      "price": 3500,
      "image": "https://images.unsplash.com/...",
      "bedrooms": 1,
      "bathrooms": 1,
      "description": "A comfortable studio..."
    },
    {
      "id": 2,
      "name": "Beachside Mombasa Villa",
      "location": "Mombasa",
      "price": 8500,
      "image": "house-1.jpg",  // Local file example
      "bedrooms": 3,
      "bathrooms": 2,
      "description": "Spacious villa..."
    },
    ...
  ]
  ↓
res.json(houses)  [HTTP 200 with JSON payload]
  ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FRONTEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ↓
.then(response => setHouses(response.data))
  ↓
React State Updated: houses = [...]
  ↓
Component Re-renders
  ↓
ListingView maps houses array:
  houses.map(house => <HouseCard house={house} />)
  ↓
For Each House:
  HouseCard receives house object
  ↓
  getImageURL processes house.image:
    ├─ "https://..." → Return as absolute URL
    └─ "house-1.jpg" → Return "/house-1.jpg"
  ↓
  <img src={getImageURL(house.image)} />
  ↓
  Browser renders image:
    ├─ If absolute URL: Load from external source
    └─ If relative path: Load from http://localhost:5000/house-1.jpg
       → Express.static serves from /public/house-1.jpg
  ↓
User Sees House Card with Image
```

---

## Image Handling Examples

### Scenario 1: External Image URL

```javascript
// In Database
house.image = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"

// In HouseCard
getImageURL("https://images.unsplash.com/...")
  → Detected as starting with "https://"
  → Returned as-is
  → Browser loads from Unsplash CDN
```

### Scenario 2: Local File

```javascript
// In Database
house.image = "house-1.jpg"

// In HouseCard
getImageURL("house-1.jpg")
  → Not starting with http
  → Not starting with /
  → Prepended with "/"
  → Returns "/house-1.jpg"
  → Browser requests: GET http://localhost:5000/house-1.jpg
  → Express.static("../public") serves: public/house-1.jpg
```

### Scenario 3: Missing Image

```javascript
// In Database
house.image = null or ""

// In HouseCard
getImageURL(null)
  → Check fails (null || empty)
  → Returns placeholder URL
  → <img src="https://placehold.co/600x400/...text=Image+Unavailable" />
```

### Scenario 4: Image Load Error

```javascript
// HTML img tag has onError handler:
<img
  src={...}
  onError={(e) => {
    e.target.onerror = null;  // Prevent infinite loop
    e.target.src = "https://placehold.co/...";  // Fallback
  }}
/>

// If image fails to load:
// → onError callback triggered
// → Replaces src with placeholder
// → Prevents broken image icons
```

---

## API Query Examples

### Basic Request

```bash
GET http://localhost:5000/api/houses

Response: 200 OK
[
  { id: 1, name: "...", location: "...", price: 3500, image: "...", ... },
  { id: 2, name: "...", location: "...", price: 8500, image: "...", ... },
  ...
]
```

### With Search

```bash
GET http://localhost:5000/api/houses?search=Nairobi

Response: 200 OK
[
  { id: 1, name: "Cozy Nairobi Studio", location: "Nairobi", ... },
  { id: 4, name: "Thika Family House", location: "Nairobi", ... }
]
```

### With Pagination

```bash
GET http://localhost:5000/api/houses?page=1&limit=5

Response: 200 OK
[
  // First 5 houses
]
```

---

## Error Handling

### Backend Errors

```javascript
try {
  const [houses] = await db.query(query, params);
  res.json(houses);
} catch (err) {
  console.error("Error fetching houses:", err);
  res.status(500).json({ error: "Internal Server Error" });
}
```

### Frontend Errors

```javascript
useEffect(() => {
  axios
    .get("/api/houses")
    .then((response) => setHouses(response.data))
    .catch((error) => {
      console.error("Error fetching houses:", error);
      // App continues with empty houses array
    });
}, []);
```

### Image Errors

```javascript
<img
  src={getImageURL(house.image)}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/...";
  }}
/>
```

---

## Performance Considerations

1. **Database Query**:

   - ✅ Uses indexed primary key (id)
   - ✅ Simple SELECT query (fast)
   - ✅ Pagination prevents loading all records

2. **Image Loading**:

   - ✅ External images cached by browser
   - ✅ Local images served as static files (fast)
   - ✅ Lazy loading via React (not implemented but possible)

3. **React Rendering**:
   - ✅ Uses keys in map (optimized list rendering)
   - ✅ Separate components (reusable, efficient)
   - ✅ State managed at App level (single source of truth)

---

## Deployment Checklist

- [ ] Database credentials in `.env` file
- [ ] `REACT_APP_API_URL` set to production backend URL
- [ ] Images uploaded to `public/` folder
- [ ] Database populated with house records
- [ ] Backend running on correct port
- [ ] CORS configured if frontend/backend on different domains
- [ ] Static file serving verified
- [ ] Error logs checked in production

---

## Testing Checklist

- [ ] House cards load with correct images
- [ ] Search functionality filters by location
- [ ] Pagination works if enabled
- [ ] Clicking house card shows detail view
- [ ] Detail view displays all house information
- [ ] Missing images show placeholder
- [ ] Both external and local images display
- [ ] Booking system uses correct house data
