# Schema for parsing a CV (Unchanged)
CV_SCHEMA = {
    "type": "object",
    "properties": {
        "metadata": {
            "description": "Thông tin về file CV gốc và thời gian quét (Model sẽ để null nếu không có trong text)",
            "type": "object",
            "properties": {
                "cv_id": {"type": ["string", "null"], "format": "uuid"},
                "source_file_name": {"type": ["string", "null"]},
                "uploaded_by": {"type": ["string", "null"]},
                "scanned_at": {"type": ["string", "null"], "format": "date-time"}
            }
        },
        "basics": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "label": {"type": "string", "description": "e.g., 'Software Engineer'"},
                "email": {"type": "string"},
                "summary": {"type": "string"},
            }
        },
        "work": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Company name"},
                    "position": {"type": "string"},
                    "startDate": {"type": "string", "description": "Format YYYY-MM-DD"},
                    "highlights": {"type": "array", "items": {"type": "string"}}
                }
            }
        },
        "education": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "institution": {"type": "string"},
                    "area": {"type": "string", "description": "Field of study"},
                    "studyType": {"type": "string", "description": "e.g., 'Bachelor'"}
                }
            }
        }
    },
    "required": ["basics", "work"]
}

# Schema for parsing a Job Description (JD)
# *** THIS IS YOUR NEW, UPDATED SCHEMA ***
# Note: We only use the core schema object, not the root-level
# "$schema", "title", or "description" tags for the tool's parameters.
JD_SCHEMA = {
    "type": "object",
    "properties": {
        "metadata": {
            "description": "Thông tin về file JD gốc và thời gian quét (Model sẽ để null nếu không có trong text)",
            "type": "object",
            "properties": {
                "jd_id": {"type": ["string", "null"], "format": "uuid"},
                "source_file_name": {"type": ["string", "null"]},
                "uploaded_by": {"type": ["string", "null"]},
                "scanned_at": {"type": ["string", "null"], "format": "date-time"}
            }
        },
        "basic_info": {
            "description": "Thông tin cơ bản định danh công việc",
            "type": "object",
            "properties": {
                "job_title": {"type": "string"},
                "level": {"type": "string",
                          "enum": ["intern", "junior", "middle", "senior", "lead", "manager", "other"]},
                "department": {"type": ["string", "null"]},
                "location": {"type": ["string", "null"]},
                "job_type": {"type": ["string", "null"],
                             "enum": ["full-time", "part-time", "contract", "internship"]}
            },
            "required": ["job_title"]
        },
        "content": {
            "description": "Nội dung văn bản chi tiết của JD",
            "type": "object",
            "properties": {
                "summary": {"type": ["string", "null"]},
                "responsibilities": {"type": "array", "items": {"type": "string"}},
                "benefits": {"type": "array", "items": {"type": "string"}},
                "salary_range": {
                    "type": "object",
                    "properties": {
                        "min": {"type": ["number", "null"]},
                        "max": {"type": ["number", "null"]},
                        "currency": {"type": "string", "default": "VND"},
                        "text": {"type": ["string", "null"]}
                    }
                }
            }
        },
        "match_criteria": {
            "description": "Các tiêu chí cốt lõi dùng để so khớp với CV",
            "type": "object",
            "properties": {
                "experience": {
                    "type": "object",
                    "properties": {
                        "min_years": {"type": "number", "minimum": 0, "default": 0},
                        "max_years": {"type": ["number", "null"]},
                        "description": {"type": ["string", "null"]}
                    }
                },
                "education": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "degree": {"type": ["string", "null"]},
                            "major": {"type": ["string", "null"]},
                            "level": {"type": "string", "enum": ["mandatory", "preferred"], "default": "preferred"}
                        }
                    }
                },
                "skills": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "type": {"type": "string", "enum": ["technical", "soft", "language"]},
                            "level": {"type": "string", "enum": ["mandatory", "preferred"], "default": "preferred"},
                            "weight": {"type": "number", "minimum": 1, "maximum": 5, "default": 3}
                        },
                        "required": ["name", "type", "level"]
                    }
                },
                "certifications": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "level": {"type": "string", "enum": ["mandatory", "preferred"], "default": "preferred"}
                        }
                    }
                },
                "keywords": {
                    "type": "array",
                    "items": {"type": "string"}
                }
            },
            "required": ["experience", "skills"]
        }
    },
    "required": ["basic_info", "content", "match_criteria"]
}