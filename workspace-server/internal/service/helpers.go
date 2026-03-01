package service

import "encoding/json"

// decodeCache is a helper to unmarshal json.RawMessage into a typed struct.
func decodeCache(raw json.RawMessage, target interface{}) error {
	return json.Unmarshal(raw, target)
}
