import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';

const EventRounds = ({ eventId }) => {
  const [rounds, setRounds] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventRounds = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/events/${eventId}/rounds`);
        setRounds(response.data.rounds);
        setEventInfo({
          id: response.data.event_id,
          title: response.data.event_title
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching event rounds:", err);
        setError("Failed to load event rounds");
      } finally {
        setLoading(false);
      }
    };

    fetchEventRounds();
  }, [eventId]);

  if (loading) return <div>Loading event rounds...</div>;
  if (error) return <div>{error}</div>;
  if (!rounds || rounds.length === 0) return <div>No rounds scheduled for this event</div>;

  return (
    <div>
      <h3>Event Rounds: {eventInfo?.title}</h3>
      
      {rounds.map(round => (
        <div key={round.id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h4>Round {round.round_number}</h4>
          
          {round.matches && round.matches.length > 0 ? (
            <div>
              <h5>Matches:</h5>
              <ul>
                {round.matches.map(match => (
                  <li key={match.id}>
                    {match.player1?.name || 'Player 1'} vs {match.player2?.name || 'Player 2'}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No matches scheduled for this round</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default EventRounds;