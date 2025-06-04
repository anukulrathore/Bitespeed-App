# 🧠 BiteSpeed Identity Reconciliation API

## 🚀 Hosted App Api Endpoint 

`https://bitespeed-app-1.onrender.com/api/v1/identify`

### 📥 Request Body

```json
{
  "email": "john@example.com",
  "phoneNumber": "1234567890"
}
```

### 📥 Response Body

```jsx
	{
	  "contact":{
		"primaryContatctId": 11,
		"emails": ["george@hillvalley.edu","biffsucks@hillvalley.edu"],
		"phoneNumbers": ["919191","717171"],
		"secondaryContactIds": [27]
	  }
	}
```