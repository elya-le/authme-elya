import { Link } from 'react-router-dom';
import './GroupCard.css';

const GroupCard = ({ group }) => {
    // assuming each group will have and array og images we take the first one
    const imageUrl = group.GroupImages && group.GroupImages.length > 0
        ? group.GroupImages[0].url
        : '/public/images/img.png'; 

        return (
            <div className="group-card">
                <Link to={`/groups/${group.id}`}>
                    <img src={imageUrl} alt={group.name} className="group-card-image" />
                    <div className="group-card-content">
                        <h3>{group.name}</h3>
                        <p>{group.about}</p>
                    </div>
                </Link>
            </div>
        );
};

export default GroupCard;
