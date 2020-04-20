const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});


//functions for user
const getUsers = (req, res) => {
    client.query('SELECT * FROM user', (error, result) => {
        if(error) {
            res.send([])
        } else {
            res.send(JSON.stringify(result.rows))
        }
    })
}
const getUserById = (req, res) => {
    const id = parseInt(req.params.id)

    client.query('SELECT * FROM user WHERE id = $1', [id], (error, result) => {
        if(error) {
            res.send([])
        } else {
            res.send(JSON.stringify(result.rows))
        }
    })
}

const createUser = (req, res) => {
    const {email, first_name, last_name, class_year, type} = request.body
    client.query('INSERT INTO user (email, first_name, last_name, class_year, type) VALUES ($1, $2, $3, $4, $5)', [email, first_name, last_name, class_year, type], (error, result) => {
        if(error) {
            res.send('Invalid format. Cannot create.')
        } else {
            res.send('Created successfully')
        }
    })
}
const updateUser = (req, res) => {
    const id = parseInt(req.params.id)
    const {email, first_name, last_name, class_year, type} = request.body
    client.query('UPDATE user SET email = $1, first_name = $2, last_name = $3, class_year = $4, type = $5 WHERE id = $6', [email, first_name, last_name, class_year, type, id], (error, result) => {
        if(error) {
            res.send('Invalid format. Cannot update.')
        } else {
            res.send('Updated successfully')
        }
    })
}
const deleteUser = (req, res) => {
    const id = parseInt(req.params.id)
    client.query('DELETE FROM user WHERE id = $1', [id], (error, result) => {
        if (error) {
            res.send('Error. Query not found')
        } else {
            res.send('Deleted succesfully')
        }
    })
}


//functions for question
const getQuesions = (req, res) => {
    client.query('SELECT * FROM question', (error, result) => {
        if(error) {
            res.send([])
        } else {
            res.send(JSON.stringify(result.rows));
        }
    })
}
const getQuesiontById = (req, res) => {
    const id = parseInt(req.params.id)

    client.query('SELECT * FROM questions WHERE id = $1', [id], (error, result) => {
        if(error) {
            res.send([])
        } else {
            res.send(JSON.stringify(result.rows))
        }
    })
}
const createQuestion = (req, res) => {
    const {title, body, hint, suggested_time} = req.body
    client.query('INSERT INTO question (title, body, hint, suggested_time) VALUES ($1, $2, $3, $4)', [title, body, hint, suggested_time], (error, result) => {
        if(error) {
            res.send('Invalid format. Cannot create.')
        } else {
            res.send('Created successfully')
        }
    })

}
const updateQuestion = (req, res) => {
    const id = parseInt(req.params.id)
    const {title, body, hint, suggested_time} = req.body
    client.query('UPDATE question SET title = $1, body = $2, hint = $3, suggested_time = $4 WHERE id = $5', [title, body, hint, suggested_time, id], (error, result) => {
        if(error) {
            res.send('Invalid format. Cannot update.')
        } else {
            res.send('Updated successfully')
        }
    })
}
const deleteQuestion = (req, res) => {
    const id = parseInt(req.params.id)
    client.query('DELETE FROM question WHERE id = $1', [id], (error, result) => {
        if (error) {
            res.send('Error. Query not found')
        } else {
            res.send('Deleted succesfully')
        }
    })
}


//functions for events
const getEvents = (req, res) => {
    client.query('SELECT * FROM event', (error, result) => {
        if(error) {
            res.send([])
        } else {
            res.send(JSON.stringify(result.rows));
        }
    })
}
const getEventById = (req, res) => {
    const id = parseInt(req.params.id)
    client.query('SELECT * FROM event WHERE id = $1', [id], (error, result) => {
        if(error) {
            res.send([])
        } else {
            res.send(JSON.stringify(result.rows))
        }
    })
}
const createEvent = (req, res) => {
    const {title, date, summary} = req.body 
    client.query('INSET INTO event(title, date, summary) VALUES ($1, $2, $3)' [title, date, summary], (error, result) => {
        if(error) {
            res.send('Invalid format, cannot create')
        } else {
            res.send('Event created successfully')
        }
    })
}
const updateEvent = (req, res) => {
    const id = parseInt(req.params.id)
    const {title, date, summary} = req.body 
    client.query('UPDATE event SET title = $1, date = $2, summary = $3 WHERE id = $4' [title, date, summary, id], (error, result) => {
        if(error) {
            res.send('Invalid format, cannot update')
        } else {
            res.send('Event update successfully')
        }
    })

}
const deleteEvent = (req, res) => {
    const id = parseInt(req.params.id)
    client.query('DELETE FROM event WHERE id = $1', [id], (error, result) => {
        if (error) {
            res.send('Error. Query not found')
        } else {
            res.send('Deleted succesfully')
        }
    })
}

//functions for interview
const getInterviews = (req, res) => {
    client.query('SELECT * FROM interview', (error, result) => {
        if(error) {
            res.send([])
        } else {
            res.send(JSON.stringify(result.rows));
        }
    })
}
const getInterviewById = (req, res) => {
    const id = parseInt(request.params.id)
    client.query('SELECT * FROM interview WHERE id = $1', [id], (error, result) => {
        if(error) {
            res.send([])
        } else {
            res.send(JSON.stringify(result.rows))
        }
    })
}
const createInterview = (req, res) => {
    const {level, questions} = req.body
    client.query('INSERT INTO interview(level, questions) VALUES ($1, $2)' [level, quesitons], (error, result) => {
        if(error) {
            res.send('Invalid format, cannot create interview')
        } else {
            res.send('Interview created successfully')
        }
    })
}
const updateInterview = (req, res) => {
    const id = parseInt(request.params.id)
    const {level, questions} = req.body
    client.query('UPDATE interview set level = $1, questions = $2 WHERE ID = $3' [level, quesitons, id], (error, result) => {
        if(error) {
            res.send('Invalid format, cannot create interview')
        } else {
            res.send('Interview created successfully')
        }
    })
}
const deleteInterview = (req, res) => {
    const id = parseInt(req.params.id)
    client.query('DELETE FROM interview WHERE id = $1', [id], (error, result) => {
        if (error) {
            res.send('Error. Query not found')
        } else {
            res.send('Deleted succesfully')
        }
    })
}


module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getQuesions,
    getQuesiontById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getInterviews,
    getInterviewById,
    createInterview,
    updateInterview,
    deleteInterview
}