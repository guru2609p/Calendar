using Calendar_1.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Calendar_1.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public EventsController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // GET: api/Events
        [HttpGet]
        public IActionResult GetEvents()
        {
            string connectionString = _configuration.GetConnectionString("DatabaseConnection") ?? "";
            string query = "SELECT id, title, event_date, room, event_time FROM event_data;";
            var eventsList = new List<Events>();

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        connection.Open();
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                eventsList.Add(new Events
                                {
                                    id = reader.GetInt32(0),
                                    title = reader.GetString(1),
                                    event_date = reader.GetDateTime(2),
                                    room = reader.IsDBNull(3) ? "" : reader.GetString(3),
                                    event_time = reader.IsDBNull(4) ? "" : reader.GetString(4)
                                });
                            }
                        }
                    }
                }
                return Ok(eventsList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/Events/add
        [HttpPost("add")]
        public IActionResult AddEvent([FromBody] Events newEvent)
        {
            if (newEvent == null || string.IsNullOrWhiteSpace(newEvent.title))
            {
                return BadRequest("Invalid event data. Title is required.");
            }

            string connectionString = _configuration.GetConnectionString("DatabaseConnection") ?? "";

            string query = @"
                INSERT INTO event_data (title, event_date, room, event_time) 
                VALUES (@Title, @EventDate, @Room, @EventTime);
                SELECT SCOPE_IDENTITY();";

            try
            {
                int newId = 0;
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        command.Parameters.Add("@Title", SqlDbType.VarChar, 100).Value = newEvent.title;
                        command.Parameters.Add("@EventDate", SqlDbType.Date).Value = newEvent.event_date;
                        command.Parameters.Add("@Room", SqlDbType.VarChar, 100).Value = newEvent.room;
                        command.Parameters.Add("@EventTime", SqlDbType.VarChar, 100).Value = newEvent.event_time;

                        connection.Open();
                        newId = Convert.ToInt32(command.ExecuteScalar());
                    }
                }

                return Ok(new { id = newId, message = "Event added successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/Events/update/{id}
        [HttpPut("update/{id}")]
        public IActionResult UpdateEvent(int id, [FromBody] Events updatedEvent)
        {
            if (updatedEvent == null || string.IsNullOrWhiteSpace(updatedEvent.title))
            {
                return BadRequest("Invalid event data. Title is required.");
            }

            string connectionString = _configuration.GetConnectionString("DatabaseConnection") ?? "";
            string query = @"
                UPDATE event_data 
                SET title = @Title, event_date = @EventDate, room = @Room, event_time = @EventTime 
                WHERE id = @Id;";

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        command.Parameters.Add("@Id", SqlDbType.Int).Value = id;
                        command.Parameters.Add("@Title", SqlDbType.VarChar, 100).Value = updatedEvent.title;
                        command.Parameters.Add("@EventDate", SqlDbType.Date).Value = updatedEvent.event_date;
                        command.Parameters.Add("@Room", SqlDbType.VarChar, 100).Value = updatedEvent.room;
                        command.Parameters.Add("@EventTime", SqlDbType.VarChar, 100).Value = updatedEvent.event_time;

                        connection.Open();
                        int rowsAffected = command.ExecuteNonQuery();

                        if (rowsAffected == 0)
                        {
                            return NotFound($"Event with ID {id} not found.");
                        }
                    }
                }
                return Ok(new { message = "Event updated successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/Events/delete/{id}
        [HttpDelete("delete/{id}")]
        public IActionResult DeleteEvent(int id)
        {
            string connectionString = _configuration.GetConnectionString("DatabaseConnection") ?? "";
            string query = "DELETE FROM event_data WHERE id = @Id;";

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        command.Parameters.Add("@Id", SqlDbType.Int).Value = id;

                        connection.Open();
                        int rowsAffected = command.ExecuteNonQuery();

                        if (rowsAffected == 0)
                        {
                            return NotFound($"Event with ID {id} not found.");
                        }
                    }
                }
                return Ok(new { message = "Event deleted successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}

