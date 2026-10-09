const defaultApiBaseUrl = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://localhost:5000/api"
  : "https://hostelmart-backend-03pk.onrender.com/api";
const API_BASE_URL = (import.meta.env.VITE_API_URL || defaultApiBaseUrl).replace(/\/$/, "");

export function getToken() {
  try {
    return localStorage.getItem("hostelmart_token") || "";
  } catch {
    return "";
  }
}

export function setToken(token) {
  try {
    if (token) {
      localStorage.setItem("hostelmart_token", token);
    } else {
      localStorage.removeItem("hostelmart_token");
    }
  } catch {
    // ignore
  }
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 1. PRODUCTS API
export async function getProducts({ category = "all", search = "", listingType = "" } = {}) {
  try {
    let url = `${API_BASE_URL}/products`;
    const params = new URLSearchParams();

    if (search && search.trim()) {
      url = `${API_BASE_URL}/products/search`;
      params.append("q", search.trim());
    } else {
      if (category && category !== "all") {
        params.append("category", category);
      }
      if (listingType) {
        params.append("listingType", listingType);
      }
    }

    const queryStr = params.toString();
    const finalUrl = queryStr ? `${url}?${queryStr}` : url;

    const response = await fetch(finalUrl, { credentials: "include" });
    if (response.ok) {
      const json = await response.json();
      const serverProducts = json?.data?.products || [];
      return serverProducts.map((p, idx) => ({
        ...p,
        aspectRatio: p.aspectRatio || (idx % 3 === 0 ? "aspect-[3/4]" : idx % 2 === 0 ? "aspect-[4/5]" : "aspect-[9/14]"),
        likesCount: p.likesCount || 0,
        commentsCount: p.commentsCount || 0,
        createdBy: p.createdBy || {
          fullName: "Campus User",
          shopName: "Hostel Store",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p._id || idx}`
        }
      }));
    }
    return [];
  } catch (err) {
    console.error("Error fetching products from backend:", err);
    return [];
  }
}

export async function getProductById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      credentials: "include"
    });
    if (response.ok) {
      const json = await response.json();
      return json?.data || null;
    }
    return null;
  } catch (err) {
    console.error("Error getting product by id:", err);
    return null;
  }
}

export async function createProduct(formData) {
  try {
    const headers = authHeaders();
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers,
      credentials: "include",
      body: formData
    });

    const json = await response.json();
    if (response.ok) {
      return { success: true, data: json?.data };
    }
    return { success: false, message: json?.message || "Failed to list item" };
  } catch (err) {
    return { success: false, message: err?.message || "Network error" };
  }
}

export async function deleteProduct(id) {
  try {
    const headers = authHeaders();
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
      headers,
      credentials: "include"
    });
    const json = await response.json();
    return { success: response.ok, message: json?.message };
  } catch (err) {
    return { success: false, message: err?.message };
  }
}

export async function getSellerProducts() {
  try {
    const headers = authHeaders();
    const response = await fetch(`${API_BASE_URL}/sellers/products/me`, {
      headers,
      credentials: "include"
    });
    if (response.ok) {
      const json = await response.json();
      return json?.data || [];
    }
    return [];
  } catch {
    return [];
  }
}

// 2. AUTHENTICATION API
export async function loginUser({ email, password }) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: email.trim().toLowerCase(), password })
    });

    const json = await response.json();
    if (response.ok) {
      const user = json?.data?.user;
      const token = json?.data?.accessToken;
      if (token) setToken(token);
      return { success: true, user, token };
    }
    return { success: false, message: json?.message || "Invalid credentials" };
  } catch (err) {
    return { success: false, message: err?.message || "Connection error to server" };
  }
}

export async function registerBuyer({ fullName, email, password, location }) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        location: location.trim()
      })
    });

    const json = await response.json();
    if (response.ok) {
      const user = json?.data?.user || json?.data;
      const token = json?.data?.accessToken;
      if (token) setToken(token);
      return { success: true, user, token };
    }
    return { success: false, message: json?.message || "Registration failed" };
  } catch (err) {
    return { success: false, message: err?.message || "Connection error to server" };
  }
}

export async function registerSeller({ fullName, shopName, email, password, location }) {
  try {
    const response = await fetch(`${API_BASE_URL}/sellers/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        fullName: fullName.trim(),
        shopName: shopName.trim(),
        email: email.trim().toLowerCase(),
        password,
        location: location.trim()
      })
    });

    const json = await response.json();
    if (response.ok) {
      const user = json?.data?.user || json?.data;
      const token = json?.data?.accessToken;
      if (token) setToken(token);
      return { success: true, user, token };
    }
    return { success: false, message: json?.message || "Seller registration failed" };
  } catch (err) {
    return { success: false, message: err?.message || "Connection error to server" };
  }
}

export async function logoutUser() {
  try {
    await fetch(`${API_BASE_URL}/users/logout`, {
      method: "POST",
      headers: authHeaders(),
      credentials: "include"
    });
  } catch {
    // ignore
  } finally {
    setToken("");
    localStorage.removeItem("hostelmart_user");
  }
}

// 3. CART API
export async function getCart() {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: authHeaders(),
      credentials: "include"
    });
    if (response.ok) {
      const json = await response.json();
      return json?.data || [];
    }
    return [];
  } catch {
    return [];
  }
}

export async function addToCart(productId, quantity = 1) {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      credentials: "include",
      body: JSON.stringify({ productId, quantity })
    });
    const json = await response.json();
    return { success: response.ok, data: json?.data, message: json?.message };
  } catch (err) {
    return { success: false, message: err?.message };
  }
}

export async function removeFromCart(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
      method: "DELETE",
      headers: authHeaders(),
      credentials: "include"
    });
    const json = await response.json();
    return { success: response.ok, data: json?.data, message: json?.message };
  } catch (err) {
    return { success: false, message: err?.message };
  }
}

// 4. WISHLIST API
export async function getWishlist() {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: authHeaders(),
      credentials: "include"
    });
    if (response.ok) {
      const json = await response.json();
      return json?.data || [];
    }
    return [];
  } catch {
    return [];
  }
}

export async function addToWishlist(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: "POST",
      headers: authHeaders(),
      credentials: "include"
    });
    const json = await response.json();
    return { success: response.ok, data: json?.data };
  } catch {
    return { success: false };
  }
}

export async function removeFromWishlist(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: "DELETE",
      headers: authHeaders(),
      credentials: "include"
    });
    const json = await response.json();
    return { success: response.ok, data: json?.data };
  } catch {
    return { success: false };
  }
}

// 5. ORDERS API
export async function placeOrder() {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: authHeaders(),
      credentials: "include"
    });
    const json = await response.json();
    return { success: response.ok, data: json?.data, message: json?.message };
  } catch (err) {
    return { success: false, message: err?.message };
  }
}

