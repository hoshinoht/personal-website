import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { education, certifications } from '../data/portfolio';
import styles from '../styles/components/Education.module.scss';

export function Education() {
  return (
    <section id="education" className={styles.section}>
      <motion.h2
        className={styles.heading}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
      >
        Education & Certifications
      </motion.h2>

      <div className={styles.columns}>
        <div className={styles.column}>
          <h3 className={styles.subheading}>Education</h3>
          <div className={styles.eduList}>
            {education.map((edu, i) => (
              <motion.div
                key={edu.institution}
                className={styles.eduCard}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <h4 className={styles.institution}>{edu.institution}</h4>
                <div className={styles.degreeRow}>
                  <div>
                    <p className={styles.degree}>{edu.degree}</p>
                    <p className={styles.field}>{edu.field}</p>
                  </div>
                  <span className={styles.period}>{edu.period}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className={styles.column}>
          <h3 className={styles.subheading}>Certifications</h3>
          <div className={styles.certList}>
            {certifications.map((cert, i) => (
              <motion.div
                key={cert.name}
                className={styles.certCard}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
              >
                <div className={styles.certIcon}>
                  <Award size={16} />
                </div>
                <div>
                  <p className={styles.certName}>{cert.name}</p>
                  <p className={styles.certIssuer}>{cert.issuer}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
