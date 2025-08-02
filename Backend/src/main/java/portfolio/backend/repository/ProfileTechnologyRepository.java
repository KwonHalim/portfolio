package portfolio.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import portfolio.backend.entity.ProfileTechnology;
import portfolio.backend.entity.Technology;

import java.util.List;

@Repository
public interface ProfileTechnologyRepository extends JpaRepository<ProfileTechnology, Long> {
        List<ProfileTechnology> findByProfileId(Long id);
}
