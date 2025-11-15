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
        "cv_id": { "type": "string" },
        "name": { "type": "string" },
        "label": {
          "type": "string",
          "description": "e.g., 'DevOps Engineer'"
        },
        "email": { "type": "string", "format": "email" },
        "phone_number": { "type": "string" },
        "summary": { "type": "string" },
        "location": {
          "type": "object",
          "properties": {
            "city": { "type": "string" },
            "countryCode": { "type": "string" }
          },
          "required": ["city", "countryCode"]
        }
      },
      "required": [
        "cv_id",
        "name",
        "label",
        "email",
        "phone_number",
        "summary",
        "location"
      ]
    },
    "work": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string", "description": "Company name" },
          "position": { "type": "string" },
          "startDate": { "type": "string", "format": "date" },
          "endDate": { "type": "string", "format": "date" },
          "highlights": {
            "type": "array",
            "items": { "type": "string" }
          }
        },
        "required": ["name", "position", "startDate", "endDate", "highlights"]
      }
    },
    "education": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "institution": { "type": "string" },
          "area": { "type": "string", "description": "Field of study" },
          "studyType": { "type": "string", "description": "e.g., 'Đại học'" }
        },
        "required": ["institution", "area", "studyType"]
      }
    },
    "skills": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "level": { "type": "string", "description": "e.g., 'Advanced'" },
          "keywords": {
            "type": "array",
            "items": { "type": "string" }
          }
        },
        "required": ["name", "keywords"]
      }
    },
    "awards": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "date": { "type": "string", "format": "date" },
          "awarder": { "type": "string" }
        },
        "required": ["title", "date", "awarder"]
      }
    }
  },
  "required": ["basics", "work", "education", "skills", "awards"]
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

FN_START_INTERVIEWING = [{
    "type": "function",
    "function": {
        "name": "start_interviewing",
        "description": "Start an interview session by introducing the interviewer, summarizing the job description.The introduction should include a welcome message to the candidate, and a friendly first question about the candidate's customer or project experience.",
        "parameters": {
            "type": "object",
            "properties": {
                "intro": {
                    "type": "string",
                    "description": "A combined introduction that greets the candidate, thanks them for their interest to join interview, and politely asks about their custome brief or their experience."
                },
                "questions": {
                    "type": "array",
                    "description": "A list of all interview questions from lower level to higher level.",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string"},
                            "text": {"type": "string"},
                            "topic": {"type": "string"},
                            "level": {
                                "type": "string",
                                "enum": ["easy", "medium", "hard"]
                            }
                        },
                        "required": ["id", "text", "topic", "level"]
                    }
                }
            },
            "required": ["intro", "questions"]
        }
    }
}]

FN_VALIDATE_READNIESS = [{
    "type": "function",
    "function": {
        "name": "validate_readiness",
        "description": "Classify readiness: ready / not_ready / uncertain based on the candidate's answer. If the candidate is ready, say to feel free to start first question. Otherwise, the candidate are ready, please lead to the first question with natural, human-like",
        "parameters": {
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": "The assistant's next reply based on the candidate is readiness. Base it on the fact that you asked the candidate to get ready for the interview session."
                },
                "text_summarize": {"type": "string"},
                "readiness": {
                    "type": "string",
                    "enum": ["ready", "not_ready", "uncertain", "skip"]
                },
                "next_stage": {
                    "type": "boolean",
                    "description": "Should move to next stage interview"
                }
            },
            "required": ["text", "text_summarize", "readiness", "next_stage"]
        }
    }
}]

FN_ASK_FOR_READINESS = [{
    "type": "function",
    "function": {
        "name": "ask_for_readiness",
        "description": (
                "Generate an appropriate assistant reply based on the candidate's readiness status. "
                "If 'ready', proceed to start the first question. "
                "If 'not_ready', respond with reassurance. "
                "If 'uncertain', gently clarify or guide the candidate."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": "The assistant's advice or response based on the candidate's input. If the candidate is ready, the response should invite them to start the interview. If the candidate is not ready or uncertain, the response should provide advice, encouragement, or a gentle prompt for clarification."
                },
                "text_summarize": {"type": "string"},
                "readiness": {
                    "type": "string",
                    "enum": ["ready", "not_ready", "uncertain"],
                    "description": "Classification of the candidate's readiness."
                },
                "next_stage": {
                    "type": "boolean",
                    "description": "Should move to next stage interview"
                }
            },
            "required": ["text", "text_summarize", "readiness", "next_stage"]
        }
    }
}]

FN_QNA_INTERVIEW = [{
    "type": "function",
    "function": {
        "name": "qna_interview",
        "description": "Analyzes and manages the interview conversation with a candidate. This function evaluates the candidate's response to a question, summarizes their answer, and determines the next interview action such as asking follow-up questions or proceeding to the next stage.",
        "parameters": {
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": "A brief, first-person summary of the candidate’s answer and its meaning."
                },
                "text_summarize": {
                    "type": "string",
                    "description":  "A brief, first-person summary of the candidate’s answer and its meaning. For example: 'I explained how teamwork helps me solve problems effectively.'"
                },
                "followup_needed": {
                    "type": "boolean",
                    "description": "True if a follow-up question is needed due to lack of understanding, an incomplete answer, or if the candidate lost focus on the question."
                },
                "next_question": {
                    "type": "boolean",
                    "description": "True if the candidate’s answer is mostly correct or relevant, and the interviewer should proceed with the next question in the same stage."
                },
                "next_stage": {
                    "type": "boolean",
                    "description": "True if the candidate has decided to terminate the interview conversation or answered all questions."
                }
            },
            "required": ["text", "text_summarize", "followup_needed", "next_question", "next_stage"]
        }
    }
}]

FN_WARMUP_INTERVIEW = [{
    "type": "function",
    "function": {
        "name": "warmup_interview",
        "description": "Handles the warm-up or closing phase of an AI interview session. Based on the candidate’s responses and the interview state, it either generates encouraging follow-up questions, summarizes the candidate’s performance, or provides a polite and motivating closing message.",
        "parameters": {
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": "Handles the warm-up or closing phase of an AI-powered interview session. Depending on the candidate’s state, it either generates a follow-up question or provides a polite closing message with encouragement and feedback."
                },
                "text_summarize": {
                    "type": "string",
                    "description": "A concise summary of the candidate’s performance or main points from their responses. Used to evaluate clarity, structure, and relevance."
                },
                "followup_needed": {
                    "type": "boolean",
                    "description": "Indicates whether the AI interviewer should ask a follow-up question based on the current response. True = another question needed; False = move on."
                },
                "complete_interview": {
                    "type": "boolean",
                    "description": "Specifies whether the entire interview session has been completed."
                }
            },
            "required": ["text", "text_summarize", "followup_needed", "complete_interview"]
        }
    }
}]
