namespace Calendar_1.Server.Models
{
    public class Events
    {
        public int id { get; set; }
        public string title { get; set; } = "";
        public DateTime event_date { get; set; }
        public string room { get; set; } = "";

        public string event_time { get; set; } = "";
    }
}
