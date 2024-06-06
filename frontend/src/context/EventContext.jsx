import { createContext, useState } from 'react';

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [eventImages, setEventImages] = useState({});

  const fetchEventImages = async (eventIds) => {
    const promises = eventIds.map(eventId => 
      fetch(`/api/events/${eventId}/images`).then(response => response.json())
    );
    const responses = await Promise.all(promises);

    const images = {};
    responses.forEach((imageData, index) => {
      if (imageData && imageData.length > 0) {
        images[eventIds[index]] = imageData[0].url;
      }
    });

    setEventImages(images);
  };

  return (
    <EventContext.Provider value={{ eventImages, fetchEventImages }}>
      {children}
    </EventContext.Provider>
  );
};
