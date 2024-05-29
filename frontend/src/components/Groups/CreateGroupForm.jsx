import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateGroupForm.css';

const CreateGroupForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [type, setType] = useState('Online');
  const [privateGroup, setPrivateGroup] = useState(false);
  const [city, setCity] = useState(''); 
  const [state, setState] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState([]);
  const [csrfToken, setCsrfToken] = useState('');

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  useEffect(() => {
    fetch('/api/csrf/restore', {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        setCsrfToken(data['XSRF-Token']);
      })
      .catch((error) => {
        console.error('Error fetching CSRF token:', error);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        name,
        about,
        type,
        private: privateGroup,
        city,
        state,
      }),
    });

    if (response.ok) {
      const data = await response.json();

      if (imageUrl) {
        const imageResponse = await fetch(`/api/groups/${data.id}/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': csrfToken,
          },
          body: JSON.stringify({
            url: imageUrl,
            preview: true,
          }),
        });

        if (!imageResponse.ok) {
          const imageErrorData = await imageResponse.json();
          setErrors(Object.values(imageErrorData.errors));
          return;
        }
      }

      navigate(`/groups/${data.id}`);
    } else {
      const errorData = await response.json();
      setErrors(Object.values(errorData.errors));
    }
  };

  return (
    <div className='form-container'>
      <form onSubmit={handleSubmit}>
        <div className='section1-create-group-header'>
          <h2>Start a New Group</h2>
        </div>
        <div className='section2-create-group-location'>
          <hr />
          <label>Set your group&apos;s location</label><br />
          <p>MeetPup groups meet locally, in person, and online. We&apos;ll connect you with people in your area.</p><br />
          <input
            type='text'
            placeholder='City'
            value={city}
            onChange={(e) => setCity(e.target.value)}
          /><br />
          <select value={state} onChange={(e) => setState(e.target.value)}>
            <option value=''>Select State</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && <p>{errors.state}</p>}
        </div>
        <div className='section3-create-group-name'>
          <hr />
          <label>What will your group&apos;s name be?</label><br />
          <input
            type='text'
            placeholder='What is your group name?'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p>{errors.name}</p>}
        </div>
        <div className='section4-create-group-about'>
          <hr />
          <label>Describe the purpose of your group.</label><br />
          <p>
            1. What is the purpose of the group?<br />
            2. Who should join?<br />
            3. What will you do at your events?
          </p><br />
          <textarea
            placeholder='Please write at least 15 characters'
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
          {errors.about && <p>{errors.about}</p>}
        </div>
        <div className='section5-create-group-type'>
          <hr />
          <label>Is this an in-person or online group?</label><br />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value='Online'>Online</option>
            <option value='In person'>In person</option>
          </select>
        </div>
        <div className='section6-create-group-privacy'>
          <hr />
          <label>Is this group private or public?</label><br />
          <select
            value={privateGroup}
            onChange={(e) => setPrivateGroup(e.target.value === 'true')}
          >
            <option value={true}>Private</option>
            <option value={false}>Public</option>
          </select>
        </div>
        <div className='section7-create-group-image'>
          <hr />
          <label>Group Image URL</label><br />
          <input
            type='text'
            placeholder='Image URL'
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          {errors.imageUrl && <p>{errors.imageUrl}</p>}
        </div>
        <div className='section8-create-group-submit'>
          <hr />
          <button className='create-group-button'>Create Group</button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroupForm;
