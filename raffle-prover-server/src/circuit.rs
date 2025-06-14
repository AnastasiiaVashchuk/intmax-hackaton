use ark_bls12_381::Fr;
use ark_relations::gr1cs::{ConstraintSynthesizer, ConstraintSystemRef};
use ark_r1cs_std::{
    alloc::AllocVar,
    fields::fp::FpVar,
    eq::EqGadget,
};
use ark_r1cs_std::boolean::{Boolean};
use ark_r1cs_std::convert::ToBitsGadget;
use std::ops::{Not, BitAnd, BitOr, BitXor};

const N: usize = 100;

#[derive(Clone)]
pub struct Circuit<T> {
    // Public inputs
    pub state0: u64,
    pub state1: u64,
    pub trusted_random: u64,

    pub winner: u64,
    pub winner_commitment: T,

    // Private inputs
    pub transfer_commitments: [Option<T>; N],
    pub transfer_proofs: [Option<T>; N],
    pub transfer_sz: u64,
}

// Implement the constraint system for the circuit
impl<T> ConstraintSynthesizer<Fr> for Circuit<T> {
    fn generate_constraints(
        self,
        cs: ConstraintSystemRef<Fr>,
    ) -> ark_relations::gr1cs::Result<()> {
        // Allocate public inputs
        let trusted_random_var = FpVar::new_input(cs.clone(), || Ok(Fr::from(self.trusted_random)))?;
        let winner_var = FpVar::new_input(cs.clone(), || Ok(Fr::from(self.winner)))?;
        let sz_var = FpVar::new_witness(cs.clone(), || Ok(Fr::from(self.transfer_sz)))?;

        // Enforce trusted_random % transfer_sz = winner.
        {
            let q_val = (self.trusted_random - self.winner) / self.transfer_sz;
            let q_var = FpVar::new_witness(cs.clone(), || Ok(Fr::from(q_val)))?;
            // Enforce: trusted_random_var = q * sz + w
            let recomputed_r = &q_var * &sz_var + &winner_var;
            recomputed_r.enforce_equal(&trusted_random_var)?;

            // Now enforce W < SZ using bit decomposition
            let w_bits = winner_var.to_bits_le()?[..64].to_vec();
            let sz_bits = sz_var.to_bits_le()?[..64].to_vec();

            // Custom less-than gadget
            let mut less = Boolean::constant(false);
            let mut equal = Boolean::constant(true);

            for i in (0..64).rev() {
                // Compute: less = (¬a ∧ b ∧ equal) ∨ less
                let not_a_and_b = w_bits[i].clone().not().bitand(&sz_bits[i]);
                let this_bit_less = not_a_and_b.bitand(&equal);
                less = less.bitor(&this_bit_less);

                // Update equality so far
                let a_eq_b = w_bits[i].clone().bitxor(&sz_bits[i]).not();
                equal = equal.bitand(&a_eq_b);
            }

            // Enforce that less == true
            less.enforce_equal(&Boolean::constant(true))?;
        }

        // Enforce transfer commitments and proofs correstness wrt to state0 and state1.
        {
            // Allocate verifying key and proof as constants/witnesses
            let vk_gadget = VerifyingKeyVar::<P, <P as Pairing>::G1AffineVar>::new_constant(cs.clone(), &self.transfer_proofs)?;
            let proof_gadget = ProofVar::<P, <P as Pairing>::G1AffineVar>::new_witness(cs.clone(), || Ok(&self.transfer_proofs))?;

            // Verify proof inside circuit
            let is_valid = vk_gadget.verify(&[state0, state1], &proof_gadget)?;

            // Enforce verification result to be true
            is_valid.enforce_equal(&Boolean::constant(true))?;
        }

        Ok(())
    }
}